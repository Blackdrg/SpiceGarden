# infra/terraform/elasticache.tf
resource "aws_elasticache_subnet_group" "redis_subnets" {
  name       = "spicegarden-1m-redis-subnets"
  subnet_ids = module.vpc.database_subnets
}

resource "aws_security_group" "redis_sg" {
  name        = "spicegarden-1m-redis-sg"
  description = "Security group for ElastiCache Redis Cluster"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "Redis from EKS worker nodes"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_elasticache_parameter_group" "redis_params" {
  name   = "spicegarden-1m-redis7-params"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"
  }

  parameter {
    name  = "cluster-enabled"
    value = "yes"
  }

  parameter {
    name  = "tcp-keepalive"
    value = "300"
  }
}

# 12-Node Redis Cluster: 6 Shards x 2 Nodes (cache.r7g.2xlarge - 8 vCPU, 53 GB RAM per node)
resource "aws_elasticache_replication_group" "redis_cluster" {
  replication_group_id       = "spicegarden-1m-redis"
  description                = "SpiceGarden 1M High-Throughput Redis Cluster"
  node_type                  = "cache.r7g.2xlarge"
  port                       = 6379
  parameter_group_name       = aws_elasticache_parameter_group.redis_params.name
  subnet_group_name          = aws_elasticache_subnet_group.redis_subnets.name
  security_group_ids         = [aws_security_group.redis_sg.id]
  automatic_failover_enabled = true
  multi_az_enabled           = true
  engine                     = "redis"
  engine_version             = "7.1"

  num_node_groups         = 6
  replicas_per_node_group = 1

  apply_immediately = true
}
