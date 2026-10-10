# infra/terraform/outputs.tf
output "eks_cluster_name" {
  description = "EKS Cluster Name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS Cluster API Endpoint"
  value       = module.eks.cluster_endpoint
}

output "alb_dns_name" {
  description = "Public DNS Name for the Application Load Balancer"
  value       = aws_lb.main_alb.dns_name
}

output "aurora_postgres_writer_endpoint" {
  description = "PostgreSQL Writer Endpoint"
  value       = aws_rds_cluster.aurora_cluster.endpoint
}

output "aurora_postgres_reader_endpoint" {
  description = "PostgreSQL Reader Endpoint"
  value       = aws_rds_cluster.aurora_cluster.reader_endpoint
}

output "elasticache_redis_configuration_endpoint" {
  description = "Redis Cluster Configuration Endpoint"
  value       = aws_elasticache_replication_group.redis_cluster.configuration_endpoint_address
}
