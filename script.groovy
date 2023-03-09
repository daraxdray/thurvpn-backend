def Versioning() {
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
      withCredentials([usernamePassword(credentialsId: 'ecr-credentials', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
          sh "docker build -t ${IMAGE_REPO}:${imageVersion} ."
          sh "echo $PASS | docker login -u $USER --password-stdin ${ECR_REPO_URL}"
          sh "docker push ${IMAGE_REPO}:${imageVersion}"
      }
} 

def deployApp() {
    echo 'deploying the image...'
    sh 'kubectl apply -f kubernetes/deployment.yaml'
    sh 'kubectl apply -f kubernetes/service.yaml'
} 

def commitVisioning() {
    //Authenticating to git
    echo "Commit current version to GitLab repo"
    withCredentials([usernamePassword(credentialsId: 'gitlab-credentials', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
        sh 'git config user.email "jenkins@example.com"'
        sh 'git config user.name "Jenkins"'
        sh "git remote set-url origin https://${USER}:${PASS}gitlab.com/korsgy-technologies/hosted-solution/thur_vpn_backend.git"
        sh 'git add .'
        sh 'git commit -m "ci: version bump"'
        sh 'git push origin HEAD:prod'
    }
}
return this
