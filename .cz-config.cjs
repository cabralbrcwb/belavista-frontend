module.exports = {
  types: [
    { value: 'feat',     name: 'feat:     Nova funcionalidade' },
    { value: 'fix',      name: 'fix:      Correção de bug' },
    { value: 'chore',    name: 'chore:    Tarefas de manutenção (build, deps, etc.)' },
    { value: 'refactor', name: 'refactor: Refatoração de código (sem alterar comportamento)' },
    { value: 'perf',     name: 'perf:     Melhoria de performance' },
    { value: 'docs',     name: 'docs:     Alterações apenas em documentação' },
    { value: 'style',    name: 'style:    Mudanças de formatação (semântica intacta)' },
    { value: 'test',     name: 'test:     Adição/remoção de testes (não usados aqui)' },
    { value: 'build',    name: 'build:    Mudanças em build ou dependências' },
    { value: 'ci',       name: 'ci:       Ajustes de CI/CD' },
    { value: 'revert',   name: 'revert:   Reverter commit' }
  ],
  scopes: [
    { name: 'reservas' },
    { name: 'hospedes' },
    { name: 'dashboard' },
    { name: 'auth' },
    { name: 'layout' },
    { name: 'core' }
  ],
  scopeOverrides: {},
  messages: {
    type: 'Selecione o tipo de mudança que está submetendo:',
    scope: 'Informe o escopo (opcional):',
    customScope: 'Digite o escopo personalizado:',
    subject: 'Escreva uma descrição breve no imperativo (ex: adiciona validação de data):',
    body: 'Forneça uma descrição mais longa (opcional). Use | para quebrar linha:',
    breaking: 'Listar mudanças BREAKING (se houver):',
    footer: 'Issues relacionadas (ex: Closes #123) (opcional):',
    confirmCommit: 'Confirmar commit acima?'
  },
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  subjectLimit: 72,
  footerPrefix: 'Refs:'
};
