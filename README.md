# Leia para uma Criança

Biblioteca digital responsiva de histórias infantis, feita com HTML, CSS e JavaScript sem dependências de runtime.

## Executar localmente

Como o site usa módulos JavaScript e Service Worker, abra a pasta por um servidor HTTP local. Por exemplo, com Node.js instalado:

```sh
npx serve .
```

Abra o endereço mostrado pelo servidor. Abrir `index.html` diretamente como arquivo não ativa os módulos nem o modo offline.

## Publicar no GitHub Pages

1. Envie esta pasta para a branch `main` do repositório.
2. Nas configurações do repositório, selecione GitHub Actions como origem do Pages.
3. O workflow `.github/workflows/pages.yml` publica o site após cada envio à `main` ou quando acionado manualmente.

Os caminhos de dados, imagens e scripts são relativos ao diretório do projeto, permitindo publicação em `usuario.github.io/repositorio/`.

## Conteúdo e recursos

- 50 histórias originais em português brasileiro, organizadas em cinco categorias.
- Cada história tem sinopse, faixa etária, tags e texto dividido em parágrafos. O tempo estimado considera leitura em voz alta com pausas.
- Busca, filtros de idade e categoria, ordenação, favoritos e histórico local.
- Leitor com posição lembrada, fonte ajustável, espaçamento, temas claro e noturno.
- Reprodutor único com seleção de trilha, volume, repetição e temporizador com redução gradual.
- PWA com cache do aplicativo e das histórias, indicador offline e carregamento sob demanda.

## Recursos pendentes

A sessão de criação de imagens não estava disponível ao preparar este projeto. Portanto, as 50 ilustrações exclusivas ainda não foram produzidas. Os cartões e o leitor identificam claramente os espaços de ilustração pendentes; não há imagens vazias disfarçadas como arte final.

Os cinco arquivos de áudio também ainda precisam ser adicionados com licença comprovada. O aplicativo mostra um aviso quando a reprodução é tentada e não carrega serviços externos de música.

Adicione arquivos WebP em `assets/illustrations/story-001.webp` até `story-050.webp` e associe os caminhos em `data/stories.json`. Para música, adicione os MP3 licenciados em `audio/` com os nomes já definidos em `js/audio.js`.

## Créditos e privacidade

Textos escritos para este projeto. Não há cadastro, anúncios, servidor de aplicação nem coleta de dados pessoais. Favoritos, histórico, preferências e progresso ficam no armazenamento local do navegador.
