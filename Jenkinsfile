#!/usr/bin/env groovy

pipeline {
  agent {
    kubernetes {
      label 'mypod'
      defaultContainer 'jnlp'
      yamlFile 'pod-jenkins-slave-template.yaml'
    }
  }
  stages {
    stage('Run maven') {
      steps {
        container('docker') {
          sh 'docker version'
        }
        container('node') {
          sh 'node --version'
        }
      }
    }
  }
}