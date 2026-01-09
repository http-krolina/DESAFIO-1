import fs from "fs/promises";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ARQUIVO_DADOS = "produtos.json";

const perguntar = (questao) =>
  new Promise((resolve) => rl.question(questao, resolve));

async function carregarProdutos() {
  try {
    const dados = await fs.readFile(ARQUIVO_DADOS, "utf-8");
    return JSON.parse(dados);
  } catch (erro) {
    return [];
  }
}

async function salvarProdutos(produtos) {
  await fs.writeFile(ARQUIVO_DADOS, JSON.stringify(produtos, null, 2));
  console.log("✅ Dados salvos com sucesso!");
}

function gerarId(produtos) {
  if (produtos.length === 0) return 1;
  const ids = produtos.map((p) => p.id);
  return Math.max(...ids) + 1;
}

async function adicionarProduto() {
  console.log("\n ADICIONAR NOVO PRODUTO");
  console.log("=========================");

  const produtos = await carregarProdutos();
  const id = gerarId(produtos);

  const nome = await perguntar("Nome do produto: ");
  const categoria = await perguntar("Categoria: ");
  const quantidade = parseInt(await perguntar("Quantidade em estoque: "));
  const preco = parseFloat(await perguntar("Preço: R$ "));

  const novoProduto = {
    id,
    nome,
    categoria,
    quantidade,
    preco,
  };

  produtos.push(novoProduto);
  await salvarProdutos(produtos);
  console.log(` Produto "${nome}" adicionado com ID: ${id}`);
}

async function listarProdutos() {
  console.log("\n LISTA DE PRODUTOS");
  console.log("===================");

  const produtos = await carregarProdutos();

  if (produtos.length === 0) {
    console.log(" Nenhum produto cadastrado.");
    return;
  }

  console.log("\nID  | NOME                  | CATEGORIA       | QTD | PREÇO");
  console.log("----|-----------------------|----------------|-----|----------");

  produtos.forEach((produto) => {
    console.log(
      `${produto.id.toString().padEnd(3)} | ${produto.nome.padEnd(
        21
      )} | ${produto.categoria.padEnd(14)} | ${produto.quantidade
        .toString()
        .padEnd(3)} | R$ ${produto.preco.toFixed(2)}`
    );
  });

  console.log(`\n Total de produtos: ${produtos.length}`);
}

async function atualizarProduto() {
  console.log("\n  ATUALIZAR PRODUTO");
  console.log("===================");

  const produtos = await carregarProdutos();
  const id = parseInt(await perguntar("ID do produto a ser atualizado: "));

  const produtoIndex = produtos.findIndex((p) => p.id === id);

  if (produtoIndex === -1) {
    console.log(" Produto não encontrado.");
    return;
  }

  const produto = produtos[produtoIndex];
  console.log(
    `\nProduto atual: ${produto.nome} - ${produto.categoria} - ${produto.quantidade} un - R$ ${produto.preco}`
  );

  console.log("\nDeixe em branco para manter o valor atual.");

  const novoNome = await perguntar(`Novo nome [${produto.nome}]: `);
  const novaCategoria = await perguntar(
    `Nova categoria [${produto.categoria}]: `
  );
  const novaQuantidade = await perguntar(
    `Nova quantidade [${produto.quantidade}]: `
  );
  const novoPreco = await perguntar(`Novo preço [${produto.preco}]: `);

  if (novoNome.trim() !== "") produto.nome = novoNome;
  if (novaCategoria.trim() !== "") produto.categoria = novaCategoria;
  if (novaQuantidade.trim() !== "")
    produto.quantidade = parseInt(novaQuantidade);
  if (novoPreco.trim() !== "") produto.preco = parseFloat(novoPreco);

  await salvarProdutos(produtos);
  console.log(` Produto ID ${id} atualizado com sucesso!`);
}

async function excluirProduto() {
  console.log("\n  EXCLUIR PRODUTO");
  console.log("================");

  const produtos = await carregarProdutos();
  const id = parseInt(await perguntar("ID do produto a ser excluído: "));

  const produtoIndex = produtos.findIndex((p) => p.id === id);

  if (produtoIndex === -1) {
    console.log(" Produto não encontrado.");
    return;
  }

  const produto = produtos[produtoIndex];
  console.log(
    `\nProduto a ser excluído: ${produto.nome} - ${produto.categoria}`
  );

  const confirmacao = await perguntar(
    "Tem certeza que deseja excluir? (s/n): "
  );

  if (confirmacao.toLowerCase() === "s") {
    produtos.splice(produtoIndex, 1);
    await salvarProdutos(produtos);
    console.log(` Produto ID ${id} excluído com sucesso!`);
  } else {
    console.log(" Exclusão cancelada.");
  }
}

async function buscarProduto() {
  console.log("\n🔍 BUSCAR PRODUTO");
  console.log("================");

  const produtos = await carregarProdutos();
  const opcao = await perguntar("Buscar por: (1) ID ou (2) Nome: ");

  if (opcao === "1") {
    const id = parseInt(await perguntar("ID do produto: "));
    const produto = produtos.find((p) => p.id === id);

    if (produto) {
      exibirDetalhesProduto(produto);
    } else {
      console.log(" Nenhum produto encontrado com este ID.");
    }
  } else if (opcao === "2") {
    const termo = (await perguntar("Nome ou parte do nome: ")).toLowerCase();
    const produtosEncontrados = produtos.filter((p) =>
      p.nome.toLowerCase().includes(termo)
    );

    if (produtosEncontrados.length > 0) {
      console.log(`\n ${produtosEncontrados.length} produto(s) encontrado(s):`);
      produtosEncontrados.forEach((produto) => {
        exibirDetalhesProduto(produto);
        console.log("---");
      });
    } else {
      console.log(" Nenhum produto encontrado com este nome.");
    }
  }
}

function exibirDetalhesProduto(produto) {
  console.log("\n DETALHES DO PRODUTO");
  console.log("=====================");
  console.log(`ID: ${produto.id}`);
  console.log(`Nome: ${produto.nome}`);
  console.log(`Categoria: ${produto.categoria}`);
  console.log(`Quantidade em estoque: ${produto.quantidade}`);
  console.log(`Preço: R$ ${produto.preco.toFixed(2)}`);
}

async function mostrarMenu() {
  console.log("\n=========================================");
  console.log("🛒 GERENCIAMENTO DE PRODUTOS - AGILSTORE");
  console.log("=========================================");
  console.log("1.  Adicionar produto");
  console.log("2.  Listar produtos");
  console.log("3.   Atualizar produto");
  console.log("4.   Excluir produto");
  console.log("5.  Buscar produto");
  console.log("0.  Sair");
  console.log("=========================================");

  const opcao = await perguntar("Escolha uma opção: ");

  switch (opcao) {
    case "1":
      await adicionarProduto();
      break;
    case "2":
      await listarProdutos();
      break;
    case "3":
      await atualizarProduto();
      break;
    case "4":
      await excluirProduto();
      break;
    case "5":
      await buscarProduto();
      break;
    case "0":
      console.log("👋 Até logo!");
      rl.close();
      process.exit(0);
      break;
    default:
      console.log(" Opção inválida!");
  }

  await mostrarMenu();
}

async function iniciar() {
  console.log(" Carregando dados...");

  try {
    await fs.access(ARQUIVO_DADOS);
  } catch {
    await salvarProdutos([]);
  }

  await mostrarMenu();
}

rl.on("close", () => {
  console.log("\n Programa encerrado.");
  process.exit(0);
});

iniciar().catch(console.error);
