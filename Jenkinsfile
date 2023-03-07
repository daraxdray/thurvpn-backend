#!/usr/bin/env groovy

def gv

pipeline {
    agent any
    tools {nodejs "node"}

    environment {
        ECR_REPO_URL = '844268948863.dkr.ecr.us-east-1.amazonaws.com'
        IMAGE_REPO = "${ECR_REPO_URL}/thurapi"
    }

    stages {
        stage("init") {
            steps {
                script {
                    gv = load "script.groovy"
                }
            }
        }

        stage('Increment Version') {

            steps {
                script {
                    gv.Versioning()
                }
            }
        }

        stage("build app") {

            steps {
                script {
                    gv.buildApp()
                }
            }
        }
        stage("build image") {
            steps {
                script {
                    gv.buildImage()
                }
            }
        }
        stage("deploy") {
            environment {
                AWS_ACCESS_KEY_ID = credentials('jenkins_aws_access_key_id')
                AWS_SECRET_ACCESS_KEY = credentials('jenkins_aws_secret_access_key')
            }
            steps {
                script {
                    // gv.deployApp()
                    echo 'deploying the image...'
                    sh 'envsubst < kubernetes/deployment.yaml | kubectl apply -f -'
                    sh 'envsubst < kubernetes/service.yaml | kubectl apply -f -'
                }
            }

        }
        stage('commit version update') {
            steps {
                script {
                    gv.commitVisioning()
                }
            }
        }



    }
}
