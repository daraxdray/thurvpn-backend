#!/usr/bin/env groovy
//Shared library
library identifier: 'korsgy-shared-library-main@master', retriever: modernSCM(
        [$class: 'GitSCMSource',
         remote: 'https://gitlab.com/korsgy-technologies/korsgy-shared-library-main.git',
         credentialsId: 'gitlab-credentials'
        ]
)


pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
    }
    environment {
        regDomain           = 'registry.digitalocean.com'
        regName             = "${regDomain}/ogc-reg"
        registryCredentials = 'thurvpnapi-reg-cred'
        imageName           = 'thurvpnapi'
        clusterAPI          = 'DOKS-API-URL'
        clusterCredentials  = 'thurvpnapi-config'
    }
    stages {

        stage('Increment Version') {
            when {
                expression {
                    BRANCH_NAME == 'prod'
                }
            }
            steps {
                script {
                    echo "Incrementing ${imageName} version..."
                    // NOTE: Please change minor with major or patch, Depends on the Update.
                    sh 'npm version minor --no-git-tag-version'
                    sh 'chmod +x versionfile.sh'
                    APPL_VERSION = sh(
                        script: './versionfile.sh',
                        returnStdout: true
                    ).trim()
                    env.imageVersion = "${APPL_VERSION}"
                }
            }
        }
        stage('Build Image') {
            when {
                expression {
                    BRANCH_NAME == 'prod'
                }
            }
            steps {
                script {
                    dockerLogin(env.registryCredentials , env.regName)
                    dockerBuild(env.regName , env.imageName , env.imageVersion)
                }
            }
        }
        stage('Push Image') {
            when {
                expression {
                    BRANCH_NAME == 'prod'
                }
            }
            steps {
                script {
                   dockerPush(env.regName , env.imageName , env.imageVersion)
                }
            }
        }
        stage('Deploy to K8S Cluster') {
            when {
                expression {
                    BRANCH_NAME == 'prod'
                }
            }
            steps {
                script {
                    withCredentials([string(credentialsId: "${clusterAPI}", variable: 'url')]) {
                        kubeDeploy(env.regName , env.imageName , env.imageVersion , env.clusterCredentials, "${url}") 
                    }
                }
            }
        }

        stage('Commit Version Update') {
            when {
                expression {
                    BRANCH_NAME == 'prod'
                }
            }
            steps {
                script {
                    //Authenticating to git
                    withCredentials([usernamePassword(
                        credentialsId: 'gitlab-credentials',
                        passwordVariable: 'PASS',
                        usernameVariable: 'USER'
                    )]){
                        sh 'git config --global user.email "jenkins@example.com"'
                        sh 'git config --global user.name "jenkins"'
                        sh "git remote set-url origin https://${USER}:${PASS}@gitlab.com/korsgy-technologies/hosted-solution/thur_vpn_backend.git"
                        sh 'git add .'
                        sh 'git commit -m "[ci-skip] Jenkins CI Version Update"'
                        sh 'git push origin HEAD:prod'
                    }
                }
            }
        }
    }
    post {
        always {
            emailext    body: "${currentBuild.currentResult}: OGC- ${env.imageName} build ${env.BUILD_NUMBER}\n To view the result, check console output for more info at: \n $env.BUILD_URL/console",
                        to: '$DEFAULT_RECIPIENTS',
                        attachLog: true,
                        subject: "Thurvpn Backend - Build # $env.BUILD_NUMBER - ${currentBuild.currentResult}!"
        }
    }
}

