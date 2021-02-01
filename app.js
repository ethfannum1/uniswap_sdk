
// Interacción desde el lado del servidor con el protocolo de Uniswap, usando el SDK de Uniswap



// Requerir la librería SDK de Uniswap
const Uniswap = require('@uniswap/sdk');

// Especificar la Blockchain en la que vamos a funcionar, haciendo uso ya de la librería Uniswap.
const blockchainID = Uniswap.ChainId.MAINNET;

// Va a operar con la paridad ETH-Dai

// ----------------------------------
// Definición del Token ERC20 Dai:
// ----------------------------------
// Address
/* 
    const token_address = '0x6b175474e89094c44da98b954eedeac495271d0f'; https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f

    Si se pone la address así sin estar checksummed, luego da warning o error. 
    
*/  
const token_address = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f
// Decimales
const decimals = 18; // Información del token: https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f#readContract

// ----------------------------------
// Obtener una instancia del token.
// ----------------------------------
// "Token" es una clase de la librería Uniswap que nos permite instanciar un objeto representativo de la criptomoneda con la que queremos interactuar.
const Dai_instance = new Uniswap.Token(blockchainID, token_address, decimals, 'DAI', 'Dai Stablecoin');

// console.log(Dai_instance);


/*  -----------------------------------------------------------------------------
    Crear un objeto para representar la paridad del token elegido (Dai) con ETH.
    -----------------------------------------------------------------------------
    Uniswap internamente no trabaja directamente con ETH, sino con otro token ERC20 WETH (Wrapped ETH) que sustituye al ETH.
    Entonces se crea el objeto de paridad: DAI - WETH. 
*/
const trade = async () => {

    // ( 1 )
    /*  Paridad entre: Dai_instance y WETH, 
        donde WETH es un array de objetos WETH,
        al que hay que especificarle el índice para seleccionar el objeto WETH correspondiente a la red blockchain de ETH que se quiera: mainnet en este caso. 
    */
    const pair = await Uniswap.Fetcher.fetchPairData(Dai_instance, Uniswap.WETH[blockchainID]);
    console.log(pair);
 

    // ( 2 )
    //  Generar instancia de objeto referente a la ruta que queremos: par DAI-ETH. 
    
    /*  Se puede poner: [pair] o [pair, ]
        El primer parámetro de "Uniswap.Route()" es un array de objetos del tipo de pair, 
        que representan los distintos emparejamientos = saltos entre distintas pools que habrán de darse, para finalmente conseguir el que buscamos: DAI-WETH.
        Ponemos el primero de todos que es el nuestro: DAI-WETH:
        si no fuera suficiente porque no existiese en las pool, habría que meter otros pares que lo complementasen hasta llegar al nuestro.
    */   
    const route = new Uniswap.Route([pair], Uniswap.WETH[blockchainID]); // Explicación minuto 28:00 del vídeo.
    console.log(route);


    // ( 3 )
    //  Generar instancia de objeto referente al trade que queremos: par DAI-ETH. 
    
    // Se transfiere 1 ETH = 1000000000000000000 weis
    const trade = new Uniswap.Trade(route, new Uniswap.TokenAmount(Uniswap.WETH[blockchainID], 1000000000000000000), Uniswap.TradeType.EXACT_INPUT);
    console.log(trade);



    // ----------------------------------------------------------------------------------------------------------------------------------------------

    console.log(new Date());

    // Precios:

    // Precios promedio ---------------------------------------------------------------------------

    // Precio medio de 1 ETH (formateado a 6 dígitos). Si ingreso 1 ETH cuántos DAI me dan.
    console.log('Precio promedio de 1 ETH ' + route.midPrice.toSignificant(6) + ' DAI($)');

    // Precio medio de 1 DAI (formateado a 6 dígitos). Si ingreso 1 DAI cuántos ETH me dan.
    console.log('Precio promedio de 1 DAI ' + route.midPrice.invert().toSignificant(6) + ' ETH($)');
    
    // Precios promedio ---------------------------------------------------------------------------

    
    // Precios de ejecución -----------------------------------------------------------------------

    // Precio medio de 1 ETH (formateado a 6 dígitos). Si ingreso 1 ETH cuántos DAI me dan.
    console.log('Precio de ejecución de 1 ETH ' + trade.executionPrice.toSignificant(6) + ' DAI($)');

    // Precio medio de 1 DAI (formateado a 6 dígitos). Si ingreso 1 DAI cuántos ETH me dan.
    console.log('Precio de ejecución de 1 DAI ' + trade.executionPrice.invert().toSignificant(6) + ' ETH($)');

    // Precios de ejecución -----------------------------------------------------------------------


    // ----------------------------------------------------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // Variables que se necesitan para hacer un swap. Ratios que protegen/definen nuestra operación de swap:
    // -----------------------------------------------------------------------------------------------------

    // 50 BIPs , donde 1 BIP = 0,001%
    const slippageTolerance = new Uniswap.Percent('50', '10000'); // El resultado va a ser una oscilación que no supere el 0,050%
    
    // Cantidad mínima que estamos dispuestos a recibir: si meto ETH ¿qué cantidad mínima de DAI quiero recibir?
    // String.raw() = es un método que se utiliza para obtener un string crudo a partir de plantillas de string (es decir, el original, texto no interpretado).
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw; // Cantidad mínima teniendo en cuenta la desviación que estamos dispuestos a soportar.
    
    // Array con las address de las 2 criptomonedas que queremos intercambiar:
    const path = [Uniswap.WETH[blockchainID].address, Dai_instance.address];
        
    const to = ''; // Address beneficiaria: a qué address se va a adjudicar los DAI que salgan de la pool.
    
    // Tiempo de vida de la transacción
    // Math.floor(Date.now() / 1000) = segundos hasta la fecha actual.
    const deadline = Math.floor((Date.now() / 1000) / 60) + 60; // Desde que hacemos la transacción hasta que pasen 60 minutos = 1 hora.

    // Valor de la transacción.
    const value = trade.inputAmount.raw;


    /*  A partir de estas variables se contruye la transacción de swap:

        Se utiliza la función swapExactETHForTokens, usando la instancia del contrato Router versión 2.
    */

}


/////////////////////////////
trade();
/////////////////////////////





