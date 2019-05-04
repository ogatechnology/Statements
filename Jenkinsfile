#!/usr/bin/env groovy

pipeline {
  agent {
    kubernetes {
      label 'jenkins-slave'
      defaultContainer 'jnlp'
      yamlFile 'pod-jenkins-slave-template.yaml'
    }
  }
  stages {
    stage('Test') {
      steps {
        container('docker') {
          sh 'docker version'
        }
      }
    }
  }
}