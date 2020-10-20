const express = require('express')
const app = express()
const port = 7000

app.get('/', (req, res) => {
  console.log('headers------');
  console.log(req.headers);
  console.log('query params------');
  console.log(req.query);
  console.log(`start value: ${req.query['status-updated-at-start']}`);
  console.log(`end value: ${req.query['status-updated-at-end']}`);
  const data = {
    size: 100,
    total_size: 999,
    grants: [ // TODO there correct: grants
      {
        nricFin: 'XTHJ123A',
        refId: 'FRQ1234',
        grantSchemeCode: 'csg3a',
        stage: 'processing',
        remarks: 'Lorem ipsum',
        updatedAt: '2020-09-30 00:00:00',
      },
      {
        nricFin: 'ABCD1234',
        refId: 'GSH7542',
        grantSchemeCode: 'csg',
        stage: 'successful',
        remarks: 'Lorem ipsum some more',
        updatedAt: '2020-08-11 11:25:35',
      }
    ]
  };

  const errors = {
    message: 'error lah'
  }

  // res.status(404).json({errors});
  res.json({data})
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
