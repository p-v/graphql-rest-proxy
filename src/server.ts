import express from 'express'
import bodyParser from 'body-parser'
import { graphql } from 'graphql'
import { getSchema, getConfig } from './store'

export const server = express()

server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())
server.use(require('cors')())

function restructureResult(result: any, baseElement: string) {
  try {
    return baseElement.split('.')
      .reduce((finalResult: any, item: string) => finalResult[item], result)
  } catch (err) {
    return result
  }
}

server.post('/graphql', (req, res) => {
  graphql(getSchema(), req.body.query, {}, { req, res }, req.body.variables)
    .then(result => {
      const { baseElement } = res.locals
      if (baseElement) {
        res.send(restructureResult(result, baseElement))
      } else {
        res.send(result)
      }
    })
    .catch(err => {
      res.status(422).send(err)
    })
})

server.get('/ok', (_req, res) => {
  res.send({ data: 'ok' })
})

export async function runserver() {
  const port = process.env.PORT || getConfig().port || 5252
  server.listen(port, () => {
    console.log(`graphql-rest-proxy is running on http://localhost:${port}/graphql`)
  })
}
