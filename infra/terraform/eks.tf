# infra/terraform/eks.tf
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.29"

  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    # Application Worker Node Pool: 20x c6i.4xlarge (16 vCPU, 32 GB RAM each = 320 vCPU total for 160 Pods)
    backend_nodes = {
      name           = "spicegarden-backend-pool"
      instance_types = ["c6i.4xlarge"]

      min_size     = 10
      max_size     = 30
      desired_size = 20

      subnet_ids = module.vpc.private_subnets

      labels = {
        role        = "backend-workload"
        environment = "production"
      }

      taints = []

      ebs_optimized = true
      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = 100
            volume_type           = "gp3"
            iops                  = 3000
            throughput            = 125
            delete_on_termination = true
          }
        }
      }
    }

    # Dedicated Distributed Load Generator Farm: 40x c6i.2xlarge (8 vCPU, 16 GB RAM each = 320 vCPU for 1M VUs)
    k6_generator_nodes = {
      name           = "k6-generator-farm"
      instance_types = ["c6i.2xlarge"]

      min_size     = 10
      max_size     = 50
      desired_size = 40

      subnet_ids = module.vpc.private_subnets

      labels = {
        role        = "k6-load-generator"
        environment = "load-test"
      }

      taints = [
        {
          key    = "dedicated"
          value  = "load-generator"
          effect = "NO_SCHEDULE"
        }
      ]

      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = 100
            volume_type           = "gp3"
            iops                  = 3000
            throughput            = 125
            delete_on_termination = true
          }
        }
      }
    }
  }

  enable_cluster_creator_admin_permissions = true
}
