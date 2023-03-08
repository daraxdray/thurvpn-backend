provider "kubernetes" {
  # load_config_file = "false"
  host = data.aws_eks_cluster.thurvpn-cluster.endpoint
  token = data.aws_eks_cluster_auth.my-cluster.token
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.thurvpn-cluster.certificate_authority.0.data)
}


data "aws_eks_cluster" "thurvpn-cluster" {
  name = module.eks.cluster_id
}

data "aws_eks_cluster_auth" "my-cluster" {
  name = module.eks.cluster_id 
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "17.24.0"

  cluster_name = "thurvpn-eks-cluster"
  cluster_version = "1.24"

  subnets = module.thurvpn-vpc.private_subnets
  vpc_id = module.thurvpn-vpc.vpc_id

  tags = {
    environment = "development"
    application = "thurvpn"
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
