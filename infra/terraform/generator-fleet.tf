# infra/terraform/generator-fleet.tf
# ==============================================================================
# SpiceGarden 500K / 1M Distributed Load Generator Fleet
# 40x c6i.2xlarge Dedicated Instances (320 vCPUs, 640 GiB RAM, 500 Gbps Total Network)
# ==============================================================================

variable "generator_fleet_count" {
  description = "Number of dedicated distributed k6 load generator instances"
  type        = number
  default     = 40
}

variable "generator_instance_type" {
  description = "EC2 instance type for distributed load generators"
  type        = string
  default     = "c6i.2xlarge" # 8 vCPU, 16 GB RAM, 12.5 Gbps network per instance
}

# Security group for distributed load generators
resource "aws_security_group" "generator_fleet_sg" {
  name        = "spicegarden-generator-fleet-sg"
  description = "Security group for distributed k6 load generator fleet"
  vpc_id      = module.vpc.vpc_id

  egress {
    description = "Allow all outbound traffic to ALB and VPC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description     = "Fleet coordination port (k6 REST API & Prometheus Exporter)"
    from_port       = 6565
    to_port         = 9100
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  tags = {
    Name        = "spicegarden-generator-fleet-sg"
    Environment = "load-test"
  }
}

# IAM Role & Instance Profile for Generator Nodes
resource "aws_iam_role" "generator_role" {
  name = "spicegarden-generator-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.generator_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "generator_profile" {
  name = "spicegarden-generator-instance-profile"
  role = aws_iam_role.generator_role.name
}

# Cloud-Init User Data for High-Performance TCP & k6 Setup
locals {
  generator_user_data = <<-EOF
    #!/bin/bash
    set -e
    
    # 1. High-scale Kernel Sysctl Parameters
    cat << 'SYSCTL_EOF' > /etc/sysctl.d/99-k6-generator.conf
    fs.file-max = 2097152
    fs.nr_open = 2097152
    net.core.somaxconn = 65535
    net.core.netdev_max_backlog = 100000
    net.ipv4.ip_local_port_range = 1024 65535
    net.ipv4.tcp_tw_reuse = 1
    net.ipv4.tcp_fin_timeout = 15
    net.core.rmem_max = 16777216
    net.core.wmem_max = 16777216
    net.ipv4.tcp_rmem = 4096 87380 16777216
    net.ipv4.tcp_wmem = 4096 65536 16777216
    net.ipv4.tcp_max_syn_backlog = 65535
    net.ipv4.tcp_syncookies = 1
    SYSCTL_EOF
    sysctl --system

    # 2. File Descriptors & Limits
    cat << 'LIMITS_EOF' > /etc/security/limits.d/99-k6.conf
    * soft nofile 1048576
    * hard nofile 1048576
    * soft nproc 524288
    * hard nproc 524288
    LIMITS_EOF

    # 3. Install k6 and Prometheus Node Exporter
    yum update -y
    yum install -y jq curl git amazon-ssm-agent
    systemctl enable --now amazon-ssm-agent

    # Install k6
    curl -s https://dl.k6.io/key.gpg | gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list || true
    if command -v yum >/dev/null 2>&1; then
      yum-config-manager --add-repo https://dl.k6.io/rpm/repo.rpm || true
      yum install -y k6 || true
    fi

    # Start Node Exporter for Fleet Telemetry
    curl -LO https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz
    tar -xzf node_exporter-1.7.0.linux-amd64.tar.gz
    mv node_exporter-1.7.0.linux-amd64/node_exporter /usr/local/bin/
    
    cat << 'SVC_EOF' > /etc/systemd/system/node_exporter.service
    [Unit]
    Description=Node Exporter
    After=network.target

    [Service]
    User=nobody
    ExecStart=/usr/local/bin/node_exporter --web.listen-address=":9100"
    Restart=always

    [Install]
    WantedBy=multi-user.target
    SVC_EOF

    systemctl daemon-reload
    systemctl enable --now node_exporter

    echo "K6 Generator Node Initialization Complete." > /var/log/generator-init.log
  EOF
}

# Launch Template for Generator Nodes
resource "aws_launch_template" "generator_lt" {
  name_prefix   = "spicegarden-generator-"
  image_id      = "ami-0c7217cdde317cfec" # Amazon Linux 2023 or Ubuntu AMI in region
  instance_type = var.generator_instance_type

  vpc_security_group_ids = [aws_security_group.generator_fleet_sg.id]

  iam_instance_profile {
    name = aws_iam_instance_profile.generator_profile.name
  }

  user_data = base64encode(local.generator_user_data)

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 100
      volume_type           = "gp3"
      iops                  = 3000
      throughput            = 125
      delete_on_termination = true
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "spicegarden-k6-generator"
      Role        = "load-generator"
      Environment = "load-test"
    }
  }
}

# Auto Scaling Group for the 40-Instance Fleet
resource "aws_autoscaling_group" "generator_asg" {
  name_prefix         = "spicegarden-generator-fleet-"
  vpc_zone_identifier = module.vpc.private_subnets
  min_size            = var.generator_fleet_count
  max_size            = var.generator_fleet_count
  desired_capacity    = var.generator_fleet_count

  launch_template {
    id      = aws_launch_template.generator_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "spicegarden-k6-generator-fleet"
    propagate_at_launch = true
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 90
    }
  }
}

output "generator_fleet_asg_id" {
  description = "Auto Scaling Group ID for 40x c6i.2xlarge load generator fleet"
  value       = aws_autoscaling_group.generator_asg.id
}

output "generator_security_group_id" {
  description = "Security group for the generator fleet"
  value       = aws_security_group.generator_fleet_sg.id
}
