# WebUp — Sua próxima grande jogada

Site autoral em português com Three.js, GSAP e ScrollTrigger. O tabuleiro e todas as peças são geometria 3D local, sem dependência de modelos externos. Os três projetos apresentados são estudos conceituais de marcas fictícias, identificados no site.

## Executar

Na pasta deste arquivo: `npm start`. Abra http://127.0.0.1:4173. As bibliotecas necessárias já estão em `dist/vendor`; a instalação de pacotes só é necessária para atualizar essas bibliotecas. Abrir o HTML por file:// não funciona por causa dos módulos JavaScript.

## Publicar em outra hospedagem

Envie o conteúdo da pasta `dist` a qualquer hospedagem estática. Fontes do Google Fonts têm alternativas locais no CSS. A configuração do Sites está em `.openai/hosting.json`.

## Contato

WhatsApp configurado: +55 (55) 98433-2637. O visitante escreve a própria ideia no painel final ou na janela “Vamos conversar”; o botão abre uma mensagem pronta para revisão e confirmação no WhatsApp. Não há banco de dados, envio automático ou coleta local de formulários. E-mail não foi fornecido.

Oferta exibida no site: criação do site sem cobrança; 1 mês de teste grátis; depois do teste, custos de manutenção e continuidade são avaliados com o cliente. O site não informa preço ou compromisso de manutenção antes dessa avaliação.

## Recursos

- Abertura cinematográfica inspirada na referência em vídeo do Igloo fornecida pelo usuário: cenário autoral de xadrez com montanhas, névoa, rochas e partículas.
- Sete momentos em uma única cena: abertura, perspectiva, presença, serviços, exemplos, processo e oferta.
- Câmera vinculada à rolagem, névoa que muda entre momentos, partículas contínuas e casas do tabuleiro que se separam nas transições.
- Navegação por âncoras para serviços, exemplos, processo e oferta.
- Enquadramentos próprios para celular, texturas rochosas geradas localmente e materiais metálicos.
- Cena 3D com reflexos, sombras, resposta ao cursor e rolagem.
- Botão para movimentar a rainha em uma demonstração; não é uma partida ou motor de xadrez.
- Movimento e câmera ligados ao progresso da rolagem com GSAP e ScrollTrigger.
- Galeria de estudos conceituais com detalhes e briefing preenchido.
- Layout responsivo, diálogos acessíveis por teclado e preferência de movimento reduzido.
- Controle para pausar o movimento contínuo.

## Referências

- https://waelyasmina.net/articles/how-to-create-an-immersive-experience-with-three-js-and-gsap/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://threejs.org/docs/pages/WebGLRenderer.html

As skills GSAP e img2threejs não estavam instaladas. A implementação usa as bibliotecas diretamente, com o fluxo de autoria e publicação da skill Sites; não realiza conversão automática de imagem para modelo 3D.
