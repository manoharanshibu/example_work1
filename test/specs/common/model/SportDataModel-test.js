import json from '../../../data/sportData.json'
import sportModel from 'common/model/SportDataModel'
import factory from 'test/util/ObjectFactory'

describe('common/model/SportDataModel', function() {
	before(function() {
		sportModel.sports = json
		sportModel.currentGroup = 'All'
	})

	const expectMarketObj = function(market) {
		describe('creates valid market', function() {
			expect(market).to.be.an('object')
			expect(market).to.have.property('name', 'Match Result')
			expect(market).to.have.property('outright', false)
			expect(market).to.have.property('key', true)
		})
	}

	it('should have sport objects under root', function() {
		const sports = sportModel.getSports()
		expect(sports.length).to.equal(1)
		expect(sports[0]).to.equal('SOCCER')
	})

	it('should return markets node for sport', function() {
		const markets = sportModel.getMarkets('SOCCER')
		const mres = markets.MRES
		expectMarketObj(mres)
	})

    it('should return keyMarkets node for sport', function() {
		const sport = sportModel.getSport('SOCCER')
		const keyMarkets = sport.keyMarkets
		expect(keyMarkets).to.be.defined
		expect(keyMarkets).to.be.an('array')
		expect(keyMarkets).to.have.length.of(2)
	})

    it('should return market groups node for sport - getGroups', function() {
		const sport = sportModel.getSport('SOCCER')
		const groups = sport.groups
		expect(groups).to.be.defined
	})

    it('should return a market object when specifying a market type - getMarketByType', function() {
		const market = sportModel.getMarketByType('MRES', 'SOCCER')
		expectMarketObj(market)
	})

    it('should return the key market type for a sport when returnType=true || undefined - getKeyMarket', function() {
		const keyMarket = sportModel.getKeyMarket('SOCCER')
		expect(keyMarket).to.equal('MRES')
	})

    it('should return the market object for the key market when returnType=false - getKeyMarket', function() {
		const keyMarket = sportModel.getKeyMarket('SOCCER', false)
		expectMarketObj(keyMarket)
	})

	it('should return an array of market objects for all keyMarkets for a particular sport', function() {
		const keyMarkets = sportModel.getKeyMarkets('SOCCER')
		expect(keyMarkets.length).to.equal(2)
		expect(keyMarkets).to.be.an('array')
	})

	it('should return relevant groups for specified event', function() {
		const event = factory.event()
		const groups = sportModel.getGroupsForEvent(event)
		expect(groups).to.have.property('All')
		expect(groups).to.have.property('Other')
	})
})
