const axios = require('axios');
const readline = require('readline');

const apiKey = 'ef0b0973b783e0614ac87612ec04344b';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function kelvinToCelsius(kelvin) {
  return kelvin - 273.15;
}

function traduzirDescricao(descricao) {
  const traducoes = {
    'clear sky': 'céu limpo',
    'few clouds': 'poucas nuvens',
    'scattered clouds': 'nuvens dispersas',
    'overcast clouds': 'nublado',
    'light rain': 'garoando',
    'moderate rain': 'chuva moderada',
    'heavy rain': 'chuva forte',
    'thunderstorm': 'trovoada',
  };

  return traducoes[descricao] || descricao;
}

async function obterCondicoesAtuais(latitude, longitude) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
    );

    if (response.status === 200) {
      const { main, weather } = response.data;

      if (main && weather && weather.length > 0) {
        const feels_likeKelvin = main.feels_like;
        const descricao = weather[0].description;

        const feels_likeCelsius = kelvinToCelsius(feels_likeKelvin);
        const descricaoTraduzida = traduzirDescricao(descricao);

        console.log(`Sensação térmica: ${feels_likeCelsius.toFixed(2)}°C`);
        console.log(`Descrição do tempo: ${descricaoTraduzida}`);
      } else {
        console.error('Dados meteorológicos indisponíveis para as coordenadas fornecidas.');
      }
    } else {
      console.error('Erro ao obter condições atuais:', response.statusText);
    }

    rl.close();
  } catch (error) {
    console.error('Erro na requisição:', error.message);
    rl.close();
  }
}


async function obterCoordenadasDaCidade() {
  rl.question('Digite o nome da cidade: ', async (nomeCidade) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${nomeCidade}&limit=1&appid=${apiKey}`
      );

      if (response.status === 200 && response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        console.log(`Coordenadas de ${nomeCidade}: { latitude: ${lat}, longitude: ${lon} }`);
        
        obterCondicoesAtuais(lat, lon);
      } else {
        console.error('Erro ao obter coordenadas ou dados da cidade indisponíveis.');
        rl.close();
      }
    } catch (error) {
      console.error('Erro na requisição:', error.message);
      rl.close();
    }
  });
}

obterCoordenadasDaCidade();
