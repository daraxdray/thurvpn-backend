def versioning() {
    echo "Incrementing version..."
    // NOTE: Please change minor with major or patch, Depends on the Update.
    sh 'npm version patch --no-git-tag-version'
    sh 'chmod +x versionfile.sh'
    APPL_VERSION = sh(
        script: './versionfile.sh',
        returnStdout: true
    ).trim()
    env.imageVersion = "${APPL_VERSION}"
} 

def buildApp() {
    echo "building the application..."
    sh 'npm install'
} 

def buildImage() {
    echo "building the docker image..."
    sh "docker build -t ${IMAGE_REPO}:${imageVersion} ."
} 

def pushImage(){
    withAWS(credentials: 'emmanuel-aws-credentials', region: 'us-west-1'){
        echo 'deploying docker image to aws ecr...'
        sh 'aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin 844268948863.dkr.ecr.us-west-1.amazonaws.com'
        echo 'push the image to ecr'
        sh "docker push ${IMAGE_REPO}:${imageVersion}"
    }
}


def deployApp() {
    echo 'deploying the image...'
    sh 'aws eks --region us-west-1 update-kubeconfig --name korsgy-eks-cluster-68b07'
    sh 'envsubst < deployment.yml | kubectl apply -f -'
    sh 'envsubst < service.yml | kubectl apply -f -'
} 

// def commitVisioning() {
//     //Authenticating to git
//     echo "Commit current version to GitLab repo"
//     withCredentials([usernamePassword(credentialsId: 'gitlab-credentials', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
//         sh 'git config user.email "jenkins@example.com"'
//         sh 'git config user.name "jenkins"'
//         sh "git remote set-url origin https://${USER}:${PASS}@gitlab.com/korsgy-technologies/hosted-solution/thur_vpn_backend.git"
//         sh 'git add .'
//         sh 'git commit -m "ci: version bump"'
//         sh 'git push origin HEAD:devops-aws-20230224'
//     }
// }
return this
