---
layout: post
title: "Mapeando a Tech Stack de 5.571 Prefeituras do Brasil: Um Estudo com Python e Async I/O"
author: Sávio Santos
excerpt: "Analisamos mais de 5.500 sites de prefeituras brasileiras para descobrir quais linguagens, CMS, servidores web e frameworks dominam a gestão pública municipal."
---

Você já parou para pensar em qual tecnologia roda nos sites dos municípios do Brasil? Seja para emitir uma nota fiscal, consultar o Diário Oficial ou acessar o Portal da Transparência, milhões de cidadãos interagem diariamente com a infraestrutura tecnológica das prefeituras.

Para responder a essa pergunta com dados reais, desenvolvi um **inspector de tecnologia assíncrono em Python** capaz de coletar, resolver domínios e analisar a *tech stack* de todas as **5.571 prefeituras catalogadas pelo IBGE**.

Neste artigo, compartilho os principais achados do estudo, os gráficos com as estatísticas nacionais e os detalhes técnicos do crawler que desenvolvi.

---

## 📊 Principais Descobertas e Análise dos Dados

Dos **5.571 municípios** catalogados pelo IBGE, o crawler localizou e analisou com sucesso **5.107 prefeituras ativas (91,67% de taxa de resolução)**.

### 1. PHP é o Rei Absoluto do Backend Municipal
Ao analisar as linguagens e linguagens server-side identificadas:

![Linguagens e Frameworks Backend](/images/tech-backend-chart.png)

- **PHP**: Está presente em **77,8% (3.973 prefeituras)** dos sites analisados.
- **ASP.NET (Microsoft)**: Representa **26,2% (1.338 sites)**, refletindo portais legados e sistemas corporativos.
- **Java**: Presente em **16,4% (838 sites)**.
- **Laravel (PHP)**: Aparece em **8,0% (408 sites)** como a escolha moderna para novos portais sob medida.
- **Python e Node.js**: Representam juntos cerca de 5,5% do total.

---

### 2. CMS: WordPress Domina a Comunicação Institucional
Em termos de Gerenciadores de Conteúdo (CMS):

- **WordPress**: É a plataforma isolada mais utilizada, identificada em **mais de 1.480 prefeituras (~30% do total)**.
- **Joomla**: Mantém presença histórica em **170 prefeituras**.
- **Drupal & GovBR/Plone**: Utilizados principalmente por capitais e grandes metrópoles devido aos requisitos de acessibilidade e governança.
- **Wix**: Identificado em 72 pequenos municípios.

---

### 3. Servidores Web e a Crescente Adoção de Cloudflare

![Servidores Web e CDN](/images/tech-servers-chart.png)

- **Apache (32,5%)** e **Nginx (26,1%)** dividem a liderança do processamento web.
- **Cloudflare**: Detectado em **994 sites (19,4%)**, revelando uma forte preocupação das prefeituras com proteção contra ataques de negação de serviço (DDoS), aceleração via CDN e certificados SSL gratuitos.

---

### 4. Frontend: Bootstrap Universal e Elementor em Alta

![Frameworks Frontend](/images/tech-frontend-chart.png)

- **Bootstrap**: Presente em impressionantes **86,3% (4.406 sites)** dos portais. Tornou-se o padrão *de facto* para garantir responsividade no setor público.
- **jQuery**: Ainda acompanha **55,5% (2.836 sites)**.
- **Elementor**: O page builder visual do WordPress foi detectado em **551 prefeituras (10,8%)**, facilitando a edição por equipes municipais sem conhecimento técnico de código.
- **React & Vue.js**: Apresentam adoção em crescimento (5,2% e 2,0% respectivamente), impulsionados por novos portais de transparência construídos como Single Page Applications (SPAs).

---

## 🛠️ A Engenharia por Trás do Crawler (3 Minutos para 5.570 Sites)

Varrer mais de 5.500 domínios com checagem de respostas HTTP, parsing de cabeçalhos e análise de HTML pode levar horas se feito de forma síncrona. 

Para resolver o problema da escala e da performance, a arquitetura do projeto foi estruturada em módulos desacoplados:

1. **Coleta de Dados e Resolução de Domínios**:
   - Integração com a API do IBGE + cruzamento com dados abertos da comunidade.
   - Algoritmo de normalização e permutação de URLs (`.gov.br`, `pm...gov.br`, sem conectores *de/da/do*).

2. **I/O Assíncrono com `aiohttp` e `asyncio`**:
   - Utilização de `asyncio.Semaphore` para controlar a concorrência sem sobrecarregar a rede ou a resolução DNS local.
   - Ajuste de *connect timeout* para 2.5s, descartando rapidamente domínios inativos sem travar o worker.
   - Com concorrência em **100 requisições simultâneas**, o pipeline completo executou em **apenas 2 minutos e 40 segundos** (uma taxa de ~30 sites/segundo).

3. **Tech Inspector (Fingerprinting)**:
   - Inspeção de cabeçalhos HTTP (`X-Powered-By`, `Server`, `Set-Cookie`, `X-Generator`).
   - Parsing do HTML com `BeautifulSoup` em busca de meta tags, caminhos de scripts estáticos (`wp-content`, `sites/all/themes`) e objetos em memória de frameworks SPA/SSR (`__NEXT_DATA__`, `__NUXT__`).

---

## ⚠️ Limitações da Pesquisa: Os 8,33% Não Raspados

Cerca de **464 prefeituras (8,33%)** não puderam ter sua *tech stack* raspada ou identificada durante esta edição da pesquisa. As razões observadas foram:

1. **Domínios Inativos ou Inexistentes**: Pequenos municípios que não possuem portal próprio oficial ativo no momento da varredura.
2. **Bloqueios de Segurança (WAF / Rate Limit)**: Firewalls que rejeitam requisições automatizadas em lote sem navegação completa de browser.
3. **Erros de SSL/TLS & Servidores Fora do Ar**: Certificados com erro de cadeia ou servidores temporariamente inalcançáveis.

---

## 🤝 Créditos e Fontes de Dados Abertos

Construir um estudo dessa magnitude exige reconhecer o trabalho fundamental da comunidade de dados abertos no Brasil:

- **API de Localidades do IBGE**: Fonte dos dados cadastrais dos 5.571 municípios.
- **Dataset [`sites_prefeituras`](https://github.com/franklinbaldo/sites_prefeituras)**: Crédito e agradecimento especial ao projeto mantido por **[Franklin Baldo](https://github.com/franklinbaldo)**. A base pré-catalogada de URLs municipais acelerou significativamente a resolução de domínios.

---

## 🎯 Conclusão

O estudo revela uma infraestrutura municipal brasileira fortemente ancorada no ecossistema **PHP + WordPress + Bootstrap + Apache/Nginx**, combinada com uma transição contínua para camadas de segurança em nuvem (Cloudflare).

### Código-Fonte e Dataset Aberto

O projeto completo, com código-fonte em Python estruturado em módulos e o dataset final em CSV e JSON com as 5.571 prefeituras, está disponível publicamente no GitHub:

🔗 **[GitHub: stacks-usadas-sites-prefeituras-brasil](https://github.com/savi8sant8s/stacks-usadas-sites-prefeituras-brasil)**

Sinta-se à vontade para explorar o repositório, clonar o projeto ou utilizar a base de dados em suas próprias análises!
