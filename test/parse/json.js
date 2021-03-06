/*eslint no-console: 0*/

import should from 'should'
import parse from '../../src/parse'
import streamify from 'into-stream'
import collect from 'get-stream'

describe('parse json', () => {
  it('should throw on bad selector', async () => {
    should.throws(() => parse('json'))
    should.throws(() => parse('json', { selector: null }))
    should.throws(() => parse('json', { selector: 'a' }))
  })
  it('should parse an array', async () => {
    const data = [ 1, 2, 3, 4, 5 ]
    const sample = JSON.stringify(data)
    const parser = parse('json', { selector: '*' })
    const stream = streamify(sample).pipe(parser())
    const res = await collect.array(stream)
    res.should.eql(data)
  })
  it('should parse a nested object', async () => {
    const data = { a: [ 1, 123 ] }
    const sample = JSON.stringify(data)
    const parser = parse('json', { selector: 'a.*' })
    const stream = streamify(sample).pipe(parser())
    const res = await collect.array(stream)
    res.should.eql(data.a)
  })
  it('should parse an object', async () => {
    const data = { a: [ { b: 1 }, { b: 2 }, { b: 3 } ] }
    const sample = JSON.stringify(data)
    const parser = parse('json', { selector: 'a.*.b' })
    const stream = streamify(sample).pipe(parser())
    const res = await collect.array(stream)
    res.should.eql([ 1, 2, 3 ])
  })
})
