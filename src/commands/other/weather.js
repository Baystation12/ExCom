import { Constants } from 'eris'
import { weather_key } from '../../../config.js'

export const type = Constants.ApplicationCommandTypes.CHAT_INPUT

export const description = 'Gets the weather for a location.'

export const options = [
  {
    name: 'location',
    type: Constants.ApplicationCommandOptionTypes.STRING,
    description: 'the location to get the weather for.',
    required: true
  }
]

export async function handler (interaction) {
  const location = interaction.data.options?.[0].value
  await interaction.acknowledge()
    .then(() => fetch(`http://api.weatherapi.com/v1/current.json?key=${weather_key}&q=${location}`))
    .then((response) => response.json())
    .then(({ error, location, current }) => {
      if (error)
        throw new Error(error.message)
      const { name, country, localtime } = location
      const {
        condition,
        temp_c, temp_f,
        feelslike_c, feelslike_f,
        wind_kph, wind_mph,
        gust_kph, gust_mph,
        pressure_mb,
        humidity,
        precip_mm, precip_in,
        cloud
      } = current

      interaction.createFollowup(`\
**${name}, ${country}** @ ${localtime} - ${condition.text}
Temp: ${temp_c}°C / ${temp_f}°F, feels like ${feelslike_c}°C / ${feelslike_f}°F
Wind: ${wind_kph}kph / ${wind_mph}mph (gusting to ${gust_kph}kph / ${gust_mph}mph)
Rain: ${precip_mm}mm / ${precip_in}in, ${humidity}% humidity, ${pressure_mb}mb pressure, ${cloud}% cloud cover\
`)
    })
    .catch((error) => {
      console.log(error)
      interaction.createFollowup('The spell fizzled. :(')
    })
}
