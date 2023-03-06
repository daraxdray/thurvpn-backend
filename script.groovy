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
      withCredentials([usernamePassword(credentialsId: 'docker-hub-repo', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
        
          sh "docker build -t ${IMAGE_REPO}:${imageVersion} ."
          sh "echo $PASS | docker login -u $USER --password-stdin ${ECR_REPO_URL}"
          sh "docker push ${IMAGE_REPO}:${imageVersion}"
      }
} 

def deployApp() {
    echo 'deploying the image...'
    sh 'envsubst < k8s/deployment.yaml | kubectl apply -f -'
    sh 'envsubst < k8s/service.yaml | kubectl apply -f -'
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
        sh 'git push origin HEAD:devops-test-20230306'
    }
}
return this