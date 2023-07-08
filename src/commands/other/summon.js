import { Constants } from 'eris'

const types = {
  'axolotl' () {
    return fetch('https://api.animality.xyz/img/axolotl')
      .then((response) => response.json())
      .then(({ link }) => link)
  },
  'bunny' () {
    return fetch('https://api.animality.xyz/img/bunny')
      .then((response) => response.json())
      .then(({ link }) => link)
  },
  'capybara' () {
    return fetch('https://api.animality.xyz/img/capybara')
      .then((response) => response.json())
      .then(({ link }) => link)
  },
  'kitty' () {
    return fetch('https://cataas.com/cat?json=true')
      .then((response) => response.json())
      .then(({ url }) => `https://cataas.com${url}`)
  },
  'pupper' () {
    return fetch('https://random.dog/woof.json')
      .then((response) => response.json())
      .then(({ url }) => url)
  },
  'fox' () {
    return fetch('https://randomfox.ca/floof/')
      .then((response) => response.json())
      .then(({ image }) => image)
  },
  'wah' () {
    return fetch('https://api.animality.xyz/img/redpanda')
      .then((response) => response.json())
      .then(({ link }) => link)
  }
}

const allowed = Object.keys(types)

export const type = Constants.ApplicationCommandTypes.CHAT_INPUT

export const description = 'Summons a creature.'

export const options = [
  {
    name: 'type',
    type: Constants.ApplicationCommandOptionTypes.STRING,
    description: 'the type of creature to summon.',
    choices: allowed.map((key) => ({ name: key, value: key })),
    required: false
  }
]

export async function handler (interaction) {
  let key = interaction.data.options?.[0].value
  if (!allowed.includes(key)) {
    key = allowed[Math.floor(Math.random() * allowed.length)]
  }
  await interaction.acknowledge()
    .then(() => types[key]())
    .then((link) => interaction.createFollowup(link))
    .catch((error) => {
      console.log(error)
      interaction.createFollowup('The spell fizzled. :(')
    })
}
