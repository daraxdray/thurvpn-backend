#!/usr/bin/env groovy

def gv

pipeline {
    agent any
    tools {nodejs "node"}

    environment {
        ECR_REPO_URL = '844268948863.dkr.ecr.us-west-1.amazonaws.com'
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
            when {
                expression {
                    BRANCH_NAME == 'prod'
                }
            }

            steps {
                script {
                    gv.Versioning()
                }
            }
        }

        stage("build app") {
            when {
                expression {
                    BRANCH_NAME == 'prod'
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
                    BRANCH_NAME == 'prod'
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
                    BRANCH_NAME == 'prod'
                }
            }
            environment {
                AWS_ACCESS_KEY_ID = credentials('jenkins_aws_access_key_id')
                AWS_SECRET_ACCESS_KEY = credentials('jenkins_aws_secret_access_key')
                APP_NAME = 'thurapi'
            }
            steps {
                script {
                    gv.deployApp()
                }
            }

        }
        stage('commit version update') {
            when {
                expression {
                    BRANCH_NAME == 'prod'
                }
            }
            steps {
                script {
                    gv.commitVisioning()
                }
            }
        }



    }
}
