provider "kubernetes" {
  # load_config_file = "false"
  host = data.aws_eks_cluster.thurvpnapi-cluster.endpoint
  token = data.aws_eks_cluster_auth.thurvpnapi-cluster.token
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.thurvpnapi-cluster.certificate_authority.0.data)
}


data "aws_eks_cluster" "thurvpnapi-cluster" {
  name = module.eks.cluster_id
}

data "aws_eks_cluster_auth" "thurvpnapi-cluster" {
  name = module.eks.cluster_id 
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "17.24.0"

  cluster_name = "thurvpnapi-eks-cluster"
  cluster_version = "1.24"

  subnets = module.thurvpnapi-vpc.private_subnets
  vpc_id = module.thurvpnapi-vpc.vpc_id

  tags = {
    environment = "development"
    application = "thurvpnapi"
  }

  worker_groups = [
    {
      instance_type = "t2.small"
      name = "worker-group-1"
      asg_desired_capacity = 2
    },

    {
      instance_type = "t2.medium"
      name = "worker-group-2"
      asg_desired_capacity = 1
    }
  ]

}
