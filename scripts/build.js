const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync
const rootPath = path.resolve(__dirname, '..')
const firebaseAdmin = require('firebase-admin')
const serviceAccount = require('../config/makemake-dev-firebase-admin.json')

const app = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://makemake-dev.firebaseio.com'
})

const buildPages = async () => {
  const querySnapshot = await firebaseAdmin
    .firestore(app)
    .collection('projects')
    .doc('7mgD6u0ttGD6ZzIvUxtb')
    .collection('pages')
    .get()

  const pages = []
  querySnapshot.forEach((doc) => pages.push(doc.data()))

  pages.forEach((page) => {
    const filePath = path.resolve(rootPath, './pages', `${page.name}.vue`)

    const data = `
<template>
    ${page.template}
</template>

<script>
    ${page.script}
</script>

<style>
    ${page.style}
</style>
`

    fs.writeFileSync(filePath, data)
  })
}

buildPages().then(() => {
  execSync('nuxt build')
  execSync('nuxt generate')
  execSync('firebase deploy --only hosting', { stdio: 'inherit' })
  process.exit(0)
})
