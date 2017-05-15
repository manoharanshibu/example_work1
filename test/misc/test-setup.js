import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
//import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
import * as enzyme from 'enzyme'
import sinon from 'sinon'

//
// Enzyme
//
global.enzyme = enzyme
global.shallow = enzyme.shallow
global.render = enzyme.render
global.mount = enzyme.mount

//
// Chai
//
global.expect = chai.expect
global.sinon = sinon

chai.should()
chai.use(chaiEnzyme())
//chai.use(dirtyChai)
chai.use(sinonChai)
