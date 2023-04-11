#!/usr/bin/env groovy
def gv

pipeline {
    agent any
    tools {nodejs "NodeJS"}

    environment {
        ECR_REPO_URL = '844268948863.dkr.ecr.us-west-1.amazonaws.com'
        IMAGE_NAME = 'thurvpnapi'
        IMAGE_REPO = "${ECR_REPO_URL}/${IMAGE_NAME}"
    }

    stages {
        stage("init") {
            when {
                expression {
                    BRANCH_NAME == 'devops-aws-20230224'
                }
            }
            steps {
                script {
                    gv = load "script.groovy"
                }
            }
        }

        stage('Increment Version') {
            when {
                expression {
                    BRANCH_NAME == 'devops-aws-20230224'
                }
            }
            steps {
                script {
                    gv.versioning()
                }
            }
        }

        stage("build app") {
            when {
                expression {
                    BRANCH_NAME == 'devops-aws-20230224'
                }
            }
            steps {
                script {
                    gv.buildApp()
                }
            }
        }
        stage("build image") {
            when {
                expression {
                    BRANCH_NAME == 'devops-aws-20230224'
                }
            }
            steps {
                script {
                    gv.buildImage()
                }
            }
        }
        stage("deploy") {
            when {
                expression {
                    BRANCH_NAME == 'devops-aws-20230224'
                }
            }
            environment {
                AWS_ACCESS_KEY_ID = credentials('jenkins_aws_access_key_id')
                AWS_SECRET_ACCESS_KEY = credentials('jenkins_aws_secret_access_key')
                AWS_DEFAULT_REGION = "us-west-1"
            }
            steps {
                script {
                    gv.deployApp()
                }
            }

        }
        // stage('commit version update') {
        //     when {
        //         expression {
        //             BRANCH_NAME == 'devops-aws-20230224'
        //         }
        //     }
        //     steps {
        //         script {
        //             gv.commitVisioning()
        //         }
        //     }
        // }

    }
    
    post {
        always {
            emailext    body: "${currentBuild.currentResult}: Thurvpn- ${env.imageName} build ${env.BUILD_NUMBER}\n To view the result, check console output for more info at: \n $env.BUILD_URL/console",
                        to: '$DEFAULT_RECIPIENTS',
                        attachLog: true,
                        subject: "Thurvpn Backend - Build # $env.BUILD_NUMBER - ${currentBuild.currentResult}!"
        }
    }
}
