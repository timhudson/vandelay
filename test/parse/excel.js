/*eslint no-console: 0*/

import should from 'should'
import parse from '../../src/parse'
import collect from 'get-stream'
import xlsx from 'xlsx'
import { createReadStream } from 'fs'
import tmp from 'tempfile'

const arrToExcel = (arr) => {
  const headers = Object.keys(arr[0])
  const data = [
    headers,
    ...arr.map((i) => Object.values(i))
  ]
  const wb = {
    SheetNames: [ 'Test' ],
    Sheets: {
      Test: xlsx.utils.aoa_to_sheet(data)
    }
  }
  const fname = tmp('.xlsx')
  xlsx.writeFile(wb, fname)
  return createReadStream(fname)
}

describe('parse excel', () => {
  it('should throw on bad options', async () => {
    should.throws(() => parse('excel', { autoParse: 'yes' }))
    should.throws(() => parse('excel', { camelcase: 'yes' }))
  })
  it('should parse a basic list', async () => {
    const sample = [
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 },
      { a: 7, b: 8, c: 9 }
    ]
    const parser = parse('excel')
    const stream = arrToExcel(sample).pipe(parser())
    const res = await collect.array(stream)
    res.should.eql([
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 },
      { a: 7, b: 8, c: 9 }
    ])
  })
  it('should parse a basic list with autoParse', async () => {
    const sample = [
      { a: '1', b: '2', c: '3' },
      { a: 4, b: 5, c: 6 },
      { a: 7, b: ' 8', c: 9 }
    ]
    const parser = parse('excel', { autoParse: true })
    const stream = arrToExcel(sample).pipe(parser())
    const res = await collect.array(stream)
    res.should.eql([
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 },
      { a: 7, b: 8, c: 9 }
    ])
  })
  it('should trim headers', async () => {
    const sample = [
      { ' a': 1, b: 2, c: 3 },
      { ' a': 4, b: 5, c: 6 },
      { ' a': 7, b: 8, c: 9 }
    ]
    const parser = parse('excel')
    const stream = arrToExcel(sample).pipe(parser())
    const res = await collect.array(stream)
    res.should.eql([
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 },
      { a: 7, b: 8, c: 9 }
    ])
  })
  it('should parse a basic list with camelcase and autoParse', async () => {
    const sample = [
      { 'received at': 1, 'performed at': 2, called_at: 3 },
      { 'received at': '4', 'performed at': '5', called_at: '6' },
      { 'received at': 7, 'performed at': 8, called_at: 9 }
    ]
    const parser = parse('excel', { autoParse: true, camelcase: true })
    const stream = arrToExcel(sample).pipe(parser())
    const res = await collect.array(stream)
    res.should.eql([
      { receivedAt: 1, performedAt: 2, calledAt: 3 },
      { receivedAt: 4, performedAt: 5, calledAt: 6 },
      { receivedAt: 7, performedAt: 8, calledAt: 9 }
    ])
  })
})
