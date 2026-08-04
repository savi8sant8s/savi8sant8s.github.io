---
layout: single
title: "Você realmente precisa de um LLM para processar essa planilha ou JSON?"
author: Sávio Santos
excerpt: "Por que terceirizar o processamento de dados estruturados e semi-estruturados para LLMs é ineficiente e como combinar motores determinísticos (DuckDB, JSONata) para obter 100% de precisão com custo reduzido."
---

Nos últimos anos, com a popularização dos Grandes Modelos de Linguagem (LLMs), vimos uma corrida para resolver qualquer problema de software jogando prompts na tela. Se o documento é um PDF não estruturado, um contrato escaneado ou uma transcrição de áudio, o LLM é fantástico e insubstituível. 

Porém, quando o assunto é **dado estruturado ou semi-estruturado (como planilhas Excel, CSVs ou grandes JSONs)**, jogar a massa de dados inteira para a janela de contexto do modelo é um dos erros arquiteturais mais caros e ineficientes que podemos cometer.

A pergunta que devemos nos fazer é: **Será que não existe uma maneira mais barata, rápida e precisa de resolver isso usando ferramentas determinísticas para auxiliar o modelo?**

Neste artigo, compartilho a filosofia de usar **o LLM apenas como um compilador de intenção**, delegando o processamento pesado para motores determinísticos.

---

## 💡 O Paradigma: LLM como Roteador de Intenção, não como Engine de Execução

Modelos de linguagem são probabilísticos. Eles são ótimos para inferir *o que* precisa ser feito, mas não para realizar operações matemáticas, paginações ou transformações repetitivas em grandes volumes de dados.

A literatura acadêmica e a prática de engenharia já comprovaram limitações severas da dependência cega da janela de contexto:

1. **Lost in the Middle**: Pesquisadores de Stanford, UC Berkeley e Samaya AI (*Liu et al., 2023*) demonstraram no estudo *"Lost in the Middle: How Language Models Use Long Contexts"* que o desempenho dos LLMs cai drasticamente quando a informação necessária está no meio de um contexto longo, mesmo em modelos treinados para 100k+ tokens.
2. **Custo e Latência Quadrática/Linear**: Manter contextos massivos infla o custo por requisição e aumenta a latência de resposta a níveis inaceitáveis para produção.
3. **Alucinação Numérica e Estrutural**: LLMs prevêem o próximo *token* mais provável; eles não possuem uma ULA (Unidade Lógica e Aritmética) nativa para garantir agregamentos exatos ou estruturas de chave-valor estritas.

### O Fluxo Híbrido LLM + Motor Determinístico

```
┌─────────────────┐       Sintaxe / Query       ┌────────────────────────┐
│   Prompt LLM    │ ──────────────────────────> │  Motor Determinístico  │
│ (Intenção/DDL)  │                             │  (DuckDB / JSONata)    │
└─────────────────┘                             └────────────────────────┘
                                                            │
                                                     Dados │ Filtrados
                                                           ▼
                                                ┌────────────────────────┐
                                                │ Mapeador Programático  │
                                                │  (JSON de Saída 100%)  │
                                                └────────────────────────┘
```

1. **LLM (Probabilístico):** Lê os metadados (esquema, nomes de colunas, chaves do JSON) + a intenção do usuário e gera uma instrução determinística (uma query SQL ou uma expressão JSONata).
2. **Motor Determinístico:** Executa essa instrução diretamente na memória do servidor com velocidade nativa (C++/Rust) e custo zero de tokens.
3. **Mapeador Programático:** Transforma o resultado no formato final esperado pela aplicação via código determinístico.

---

## 📊 Cenário 1: Processando Planilhas Grandes sem Estourar Contexto (O Padrão DuckDB)

### O Problema Tradicional
Você tem uma planilha Excel com milhares de linhas ou múltiplas abas e precisa extrair apenas certas informações para alimentar uma API. A abordagem ingênua é converter a planilha para texto/HTML/Markdown e injetar tudo no prompt.

### A Abordagem Determinística (DuckDB + SQL)
Em vez de enviar os dados da planilha para o modelo:

1. **Envie apenas o Esquema (`DDL`):** Converta a planilha para tabelas temporárias no [DuckDB](https://duckdb.org/) (um banco OLAP analítico de altíssima performance em memória) e extraia apenas a DDL dos esquemas (`CREATE TABLE table_0 ("data" DATE, "valor" DOUBLE, ...)`).
2. **Peça ao LLM para Gerar SQL:** O prompt recebe apenas o esquema e a lista de entidades desejadas. O LLM retorna uma consulta SQL compatível com DuckDB, utilizando *aliases* (`AS`) que correspondem exatamente aos identificadores dos campos solicitados.
3. **Execução Local Nativa:** O DuckDB executa a query em microssegundos direto na memória local.
4. **Mapeamento via Código:** Um script simples lê a tabela resultante já filtrada e monta a estrutura JSON de saída com 100% de precisão estrutural.

> **Ganha-se:** Custo reduzido drasticamente (tokens caem de centenas de milhares para poucas centenas do esquema), zero risco de alucinação de dados e processamento instantâneo.

---

## 🔄 Cenário 2: Transformando e Filtrando JSONs Complexos (O Padrão JSONata)

### O Problema Tradicional
Você recebe um payload JSON gigante de uma API externa com dezenas de níveis aninhados, arrays e atributos irrelevantes, e precisa reformatar esse JSON para um esquema simplificado. Passar o JSON inteiro para o LLM reescrever é ineficiente e propício a erros de digitação de chaves.

### A Abordagem Determinística (JSONata)
Em vez de pedir para o LLM reescrever a string do JSON:

1. **Apresente o Esquema ao LLM:** Passe uma amostra das chaves do JSON e a estrutura desejada.
2. **Gere uma Expressão JSONata:** O LLM atua apenas gerando uma consulta declarativa em [JSONata](https://jsonata.org/) (linguagem leve de consulta e transformação de dados JSON).
3. **Execução pelo Evaluator JSONata:** Um evaluator JSONata na sua aplicação aplica a expressão diretamente sobre o JSON original em memória.

> **Ganha-se:** Nenhuma mutação acidental de dados, garantia de tipo, performance de microssegundos e facilidade de auditar a regra de transformação gerada.

---

## 🛠️ O Paralelo com Agentes Modernos (ex: Claude Code)

Esta filosofia de não confiar a memória inteira ao LLM e sim delegar para ferramentas determinísticas não é nova. É a base de engenharia por trás do [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) e de agentes autônomos de código:

* **Gerenciamento de Memória por Apontadores:** O Claude Code não mantém o histórico completo do seu repositório na janela de contexto (o que destruiria o orçamento de tokens e a atenção do modelo).
* **Offloading para Sistema de Arquivos:** Ele lê e grava arquivos locais (`CLAUDE.md`, arquivos temporários de planejamento) como estado de verdade e dispara ferramentas determinísticas nativas (`grep`, `glob`, `ast-grep`) para recortar cirurgicamente apenas as linhas necessárias antes de raciocinar sobre elas.

---

## 🛡️ Pormenores e Resiliência na Prática

Quando aplicamos essa estratégia no dia a dia em produção, é crucial incluir pequenas camadas de proteção (Guardrails):

1. **Normalização Prévia de Esquemas:** Nomes de colunas em planilhas humanas frequentemente vêm sujos, com espaços ou caracteres especiais. Fazer uma higienização simples (`col.strip().lower().replace(" ", "_")`) reduz falhas de sintaxe SQL drasticamente.
2. **Prompts Rígidos de Identificadores:** Instrua o LLM a sempre utilizar aspas duplas nos identificadores de colunas e tabelas (`"coluna" AS "entidade"`) para evitar erros de parser SQL no DuckDB.
3. **Fallbacks Gracioso em Camadas:** Se o LLM gerar uma consulta SQL/JSONata com erro de sintaxe, sua aplicação deve tratar o erro de forma resiliente:
   * **Fallback por Tabela:** Se a query de uma aba falhar, capture o erro e recupere a tabela original completa via `SELECT * FROM table_name`.
   * **Fallback por Pipeline:** Se o motor falhar por completo, a aplicação pode recorrer à estratégia tradicional de loteamento/paginação.

---

## 📌 Conclusão

Sempre que você estiver prestes a enviar uma massa de dados estruturados para um LLM, pergunte-se: **Eu preciso que a IA processe estes dados, ou preciso apenas que ela entenda o que fazer e escreva a instrução de processamento?**

Na maioria das vezes, combinar a capacidade de interpretação do LLM com motores determinísticos em memória como **DuckDB** e **JSONata** vai te entregar uma solução mais barata, infinitamente mais rápida e com zero margem para alucinações.