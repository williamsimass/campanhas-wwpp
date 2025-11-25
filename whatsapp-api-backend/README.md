# WhatsApp Campaign Backend

API em Node.js para gerenciar campanhas de WhatsApp usando a Meta Cloud API.

## Configuração

1.  Instale as dependências:
    ```bash
    npm install
    ```

2.  Configure as variáveis de ambiente:
    Crie um arquivo `.env` baseado no `.env.example` e preencha com suas credenciais da Meta:
    ```env
    META_TOKEN=seu_token_aqui
    PHONE_NUMBER_ID=seu_phone_number_id
    WABA_ID=seu_waba_id
    TEMPLATE_LANGUAGE=pt_BR
    PORT=3000
    ```

3.  Inicie o servidor:
    ```bash
    npm start
    ```

## Rotas da API

### `GET /api/templates`
Lista os templates aprovados na conta do WhatsApp Business.

**Exemplo de resposta:**
```json
{
  "templates": [
    {
      "name": "promo_janeiro",
      "language": "pt_BR",
      "status": "APPROVED",
      "category": "MARKETING"
    }
  ]
}
```

### `POST /api/send-template`
Envia um template para uma lista de contatos.

**Body:**
```json
{
  "template": "nome_do_template",
  "contacts": [
    { "name": "João", "phone": "5511999999999" },
    { "name": "Maria", "phone": "5521988888888" }
  ]
}
```

**Exemplo de resposta:**
```json
{
  "results": [
    {
      "name": "João",
      "phone": "5511999999999",
      "success": true,
      "messageId": "wamid.HBg..."
    }
  ]
}
```

## Testes Manuais (cURL)

**Listar Templates:**
```bash
curl http://localhost:3000/api/templates
```

**Enviar Campanha:**
```bash
curl -X POST http://localhost:3000/api/send-template \
  -H "Content-Type: application/json" \
  -d '{
    "template": "hello_world",
    "contacts": [
      { "name": "Teste", "phone": "5511999999999" }
    ]
  }'
```
