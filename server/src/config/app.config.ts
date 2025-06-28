import express, { Application } from 'express'
import { routesInit } from '../routes'
import path from 'path'
import cors from 'cors'

export default async (app: Application) => {
  app.use(cors())
  app.use(express.json())
  app.set('view engine', 'ejs')
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static(path.join(process.cwd(), 'public')))

  routesInit(app)


  app.on('error', (error) => {
    console.error(error)
    process.exit(1)
  })
}