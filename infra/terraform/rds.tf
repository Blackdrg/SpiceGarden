# infra/terraform/rds.tf
resource "aws_db_subnet_group" "rds_subnets" {
  name       = "spicegarden-1m-rds-subnets"
  subnet_ids = module.vpc.database_subnets

  tags = {
    Name = "spicegarden-1m-rds-subnet-group"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "spicegarden-1m-rds-sg"
  description = "Security group for Aurora PostgreSQL"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "PostgreSQL from EKS and PgBouncer"
    from_port       = 5432
    to_port         = 5432
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

resource "aws_rds_cluster_parameter_group" "aurora_pg_params" {
  name        = "spicegarden-1m-aurora-pg16-params"
  family      = "aurora-postgresql16"
  description = "Aurora PG16 parameters optimized for high-concurrency 1M benchmark"

  parameter {
    name  = "max_connections"
    value = "5000"
  }

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "statement_timeout"
    value = "5000" # 5s limit
  }

  parameter {
    name  = "idle_in_transaction_session_timeout"
    value = "10000" # 10s limit
  }

  parameter {
    name  = "lock_timeout"
    value = "2000" # 2s lock wait limit
  }
}

resource "aws_rds_cluster" "aurora_cluster" {
  cluster_identifier              = "spicegarden-1m-aurora-cluster"
  engine                          = "aurora-postgresql"
  engine_version                  = "16.1"
  database_name                   = "spicegarden"
  master_username                 = "spiceadmin"
  master_password                 = "SpiceGardenSecure2026!Key"
  db_subnet_group_name            = aws_db_subnet_group.rds_subnets.name
  vpc_security_group_ids          = [aws_security_group.rds_sg.id]
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.aurora_pg_params.name

  skip_final_snapshot     = true
  deletion_protection     = false
  backup_retention_period = 1
}

# Primary Writer Instance: db.r6g.16xlarge (64 vCPU, 512 GB RAM)
resource "aws_rds_cluster_instance" "cluster_writer" {
  identifier          = "spicegarden-1m-writer"
  cluster_identifier  = aws_rds_cluster.aurora_cluster.id
  instance_class      = "db.r6g.16xlarge"
  engine              = aws_rds_cluster.aurora_cluster.engine
  engine_version      = aws_rds_cluster.aurora_cluster.engine_version
  publicly_accessible = false
}

# Reader Replicas: 2x db.r6g.8xlarge (32 vCPU, 256 GB RAM each)
resource "aws_rds_cluster_instance" "cluster_readers" {
  count               = 2
  identifier          = "spicegarden-1m-reader-${count.index + 1}"
  cluster_identifier  = aws_rds_cluster.aurora_cluster.id
  instance_class      = "db.r6g.8xlarge"
  engine              = aws_rds_cluster.aurora_cluster.engine
  engine_version      = aws_rds_cluster.aurora_cluster.engine_version
  publicly_accessible = false
}
