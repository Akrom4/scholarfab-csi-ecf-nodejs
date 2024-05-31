import path from 'node:path'

import express from 'express'
import Keygrip from 'keygrip'

import cookieSession from 'cookie-session'
import morgan from 'morgan'
import helmet from 'helmet'

import { loadHomeController } from './controllers/home.controller.mjs'
import { loadRegistrationController } from './controllers/registration.controller.mjs'
import { loadSecurityController } from './controllers/security.controller.mjs'
import { loadApplicationController } from './controllers/application.controller.mjs'

import { getDatabase } from './services/database.service.mjs'
import { KeyStore } from './services/keystore.service.mjs'


export async function createApplication({ __rootdir }) {
    const db = await getDatabase({ filename: path.join(__rootdir,'data','app.db') })
    const ks = KeyStore.getInstance(db)
    const kl = await ks.getKeys()

    const app = express()

    app.set('views', path.join(__rootdir, 'views'))
    app.set('view engine', 'ejs')

    app.set('g:db', db)
    app.set('g:ks', ks)

    app.use([
        morgan('tiny'),
        helmet(),
        
        express.static(path.join(__rootdir, 'public')),
        express.urlencoded({ extended: true }),
        express.json(),
        
        cookieSession({ 
            name: 'session', 
            keys: new Keygrip(kl), 
            maxAge: 86400000, 
            httpOnly: true 
        }),


        // (req, res, next) => {
        //     console.log('req.session.user', req.session.user)
        //     console.log('notes', req.session.notes)
        //     next()
        // }

    ])
    
    loadHomeController(app)
    loadRegistrationController(app)
    loadSecurityController(app)
    loadApplicationController(app)

    return app
}
