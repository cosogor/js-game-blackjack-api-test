import request from 'supertest'

test('It adds two numbers - smoke test shows what environment setup performed correctly', () => {
  expect(1 + 1).toBe(2)
})

let baseUrl = 'https://deckofcardsapi.com/'

describe('1.Navigate to https://deckofcardsapi.com/  + 2. Confirm the site is up', () => {
  it('get should return a 200 status code', async () => {
    const response = await request(baseUrl).get('')
    expect(response.statusCode).toBe(200)
  })
  it('post should return a 200 status code', async () => {
    const response = await request(baseUrl).post('')
    expect(response.statusCode).toBe(200)
  })
})

describe('3.Get a new deck', () => {
  let deckId

  beforeAll(async () => {
    // Get a new deck
    const response = await request(baseUrl).get('api/deck/new/')
    deckId = response.body.deck_id
  })

  it('should return a 200 status code', async () => {
    const response = await request(baseUrl).get('')
    expect(response.statusCode).toBe(200)
  })

  it('should open a new deck of cards witn deckId shoud be defined', async () => {
    expect(deckId).toBeDefined()
  })

  it('post should shuffle the deck when requested', async () => {
    const response = await request(baseUrl).post(`api/deck/${deckId}/shuffle/`)
    expect(response.body.shuffled).toBe(true)
  })

  it('should draw a card from the deck', async () => {
    const response = await request(baseUrl).get(`api/deck/${deckId}/draw/`)
    expect(response.body.success).toBe(true)
    expect(response.body.cards).toHaveLength(1)
    expect(response.body.remaining).toBe(51)
  })

  it('should add Jokers to the deck when requested', async () => {
    const response = await request(baseUrl).get(
      `api/deck/${deckId}/draw/?count=2&jokers_enabled=true`
    )
    expect(response.body.success).toBe(true)
    expect(response.body.cards).toHaveLength(2)
    expect(response.body.remaining).toBe(49)
  })
})

describe('4.Shuffle it', () => {
  let deckId

  beforeAll(async () => {
    // Get a new deck
    const response = await request(baseUrl).get('api/deck/new/')
    deckId = response.body.deck_id
  })
  it('shuffle check', async () => {
    const response = await request(baseUrl).get(`api/deck/${deckId}/shuffle/`)
    expect(response.body.shuffled).toBe(true)
  })
})

describe('5.Deal three cards to each of two players', () => {
  let deckId
  let player1Cards
  let player2Cards

  beforeAll(async () => {
    // Create new dec
    const response = await request(baseUrl).get(`/api/deck/new/`)
    deckId = response.body.deck_id

    // Deal 3 cards for player1
    const drawResponse1 = await request(baseUrl).get(`/api/deck/${deckId}/draw/?count=3`)
    player1Cards = drawResponse1.body.cards
    // Deal 3 cards for player2
    const drawResponse2 = await request(baseUrl).get(`/api/deck/${deckId}/draw/?count=3`)
    player2Cards = drawResponse2.body.cards
  })

  it('should draw 3 cards for each player', async () => {
    expect(player1Cards).toHaveLength(3)
    expect(player2Cards).toHaveLength(3)
  })

  it('6.Check whether either has blackjack + 7.If either has, write out which one does', async () => {
    const player1Total = calculateTotal(player1Cards)
    const player2Total = calculateTotal(player2Cards)
    if (player1Total == 21) {
      console.log('player1 have blackjack')
    }
    if (player1Total == 21) {
      console.log('player2 have blackjack')
    }

    expect(player1Total).not.toBe(21)
    expect(player2Total).not.toBe(21)
  })
})

function calculateTotal(cards) {
  let total = 0
  for (const card of cards) {
    // console.log(card)
    if (card.value === 'KING' || card.value === 'QUEEN' || card.value === 'JACK') {
      total += 10
    } else if (card.value === 'ACE') {
      total += 11
    } else {
      total += parseInt(card.value, 10)
    }
  }
  console.log(total)
  return total
}
