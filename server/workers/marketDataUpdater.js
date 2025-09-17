// server/workers/marketDataUpdater.js
import pool from '../db/index.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_URL = 'https://www.alphavantage.co/query';

const updateMarketData = async () => {
    if (!ALPHA_VANTAGE_API_KEY) {
        console.error('❌ Error: La ALPHA_VANTAGE_API_KEY no está definida en el archivo .env');
        return;
    }

    console.log('🤖 Iniciando el worker de actualización de precios (Alpha Vantage)...');
    const client = await pool.connect();

    try {
        console.log('🔍 Buscando activos con tickers en la base de datos...');
        const assetsResult = await client.query(
            "SELECT id, ticker_symbol FROM portfolio_assets WHERE ticker_symbol IS NOT NULL AND ticker_symbol <> ''"
        );

        if (assetsResult.rows.length === 0) {
            console.log('🟡 No se encontraron activos con tickers para actualizar. Proceso finalizado.');
            return;
        }
        
        const assetsToUpdate = assetsResult.rows;
        console.log(` Encontrados ${assetsToUpdate.length} activos para actualizar.`);

        let updatedCount = 0;
        for (const asset of assetsToUpdate) {
            try {
                const ticker = asset.ticker_symbol.toUpperCase();
                console.log(`\n📡 Obteniendo precio para ${ticker}...`);
                
                const response = await axios.get(ALPHA_VANTAGE_URL, {
                    params: {
                        function: 'TIME_SERIES_DAILY',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_API_KEY
                    }
                });

                const timeSeries = response.data['Time Series (Daily)'];
                if (response.data['Note']) {
                     console.warn(`  -> Nota de la API para ${ticker}: Has superado el límite de peticiones del plan gratuito. Inténtalo más tarde.`);
                     continue; // Salta al siguiente activo
                }

                if (timeSeries) {
                    const latestDate = Object.keys(timeSeries)[0]; // Obtenemos la fecha más reciente
                    const latestPrice = timeSeries[latestDate]['4. close']; // Obtenemos el precio de cierre
                    
                    // 1. Actualizar el valor actual del activo
                    await client.query(
                        'UPDATE portfolio_assets SET current_market_value = $1, last_updated = NOW() WHERE id = $2',
                        [latestPrice, asset.id]
                    );

                    // 2. Insertar el registro histórico (si no existe para hoy)
                    await client.query(
                        'INSERT INTO asset_value_history (asset_id, record_date, market_value) VALUES ($1, CURRENT_DATE, $2) ON CONFLICT (asset_id, record_date) DO NOTHING',
                        [asset.id, latestPrice]
                    );

                    updatedCount++;
                    console.log(`  -> ${ticker} actualizado a $${latestPrice} (precio de cierre de ${latestDate})`);
                } else {
                    console.warn(`  -> No se encontró precio para ${ticker}. Respuesta de la API:`, response.data);
                }

                // Pausa de 15 segundos para respetar el límite del plan gratuito de Alpha Vantage (5 peticiones por minuto)
                console.log('...esperando 15 segundos para la siguiente petición...');
                await new Promise(resolve => setTimeout(resolve, 15000));

            } catch (innerError) {
                console.error(`--- ❌ Error al procesar el ticker ${asset.ticker_symbol} ---`);
                if (innerError.response) {
                    console.error('Error de Alpha Vantage API:', innerError.response.data);
                }
            }
        }
        console.log(`\n✅ Proceso completado. Se actualizaron ${updatedCount} de ${assetsToUpdate.length} activos.`);

    } catch (error) {
        console.error('--- ❌ Ocurrió un error general en el worker ---', error);
    } finally {
        if (client) client.release();
        // No finalices el pool aquí para que pueda ser reutilizado por otras partes de la aplicación.
        // pool.end();
    }
};

updateMarketData();