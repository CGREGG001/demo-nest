[⬅ Back to README](../README.md)

# II. Setup Husky, Lint-staged, Commitlint

## 1. Installation des outils

```bash
# Initialisation de Husky (crée .husky/ et le script prepare)
npx husky init
```

```bash
# Installation de lint-staged et commitlint
npm install --save-dev lint-staged @commitlint/config-conventional @commitlint/cli
```

```bash
# Création de la config (format ESM pour compatibilité moderne)
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

---

## 2. Configuration des Hooks Husky

```bash
# Hook de pré-commit : Lance lint-staged
echo "npx lint-staged" > .husky/pre-commit
```

```bash
# Hook de message de commit : Lance commitlint
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

---

## 3. Configuration du package.json

Ajouter le bloc lint-staged dans le `package.json` :

```json
"lint-staged": {
  "**/*.ts": [
    "eslint --fix",
    "prettier --write"
  ],
  "**/*.{json,md,yml}": [
    "prettier --write"
  ]
}
```

---

## 4. Style de code (Prettier)

Modifier `.prettierrc` :

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

Créer `.prettierignore` :

```text
node_modules
dist
```

---

## 5 Création fichier `.editorconfig` (Recommandé pour NestJS)

**À créer à la racine du projet :**

```bash
# Création du fichier .editorconfig
touch .editorconfig
```

```bash
# (Copie le contenu ci-dessous dedans)
root = true

[*]
indent_style = space
indent_size = 2
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
end_of_line = lf

[*.md]
trim_trailing_whitespace = false
```

_Il est recommandé d'installer l'extension "EditorConfig for VS Code"_

---

## 6. Configuration du Pre-push (Optimisé)

```bash
# Vérifie le build (types TS) et lance les tests impactés
echo "npm run build && npm run test -- --onlyChanged" > .husky/pre-push
```
