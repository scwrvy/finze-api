Criando função noticias.js para API de notícias
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const NEWSAPI_KEY = process.env.NEWSAPI_KEY

export default async function handler(req, res) {
  try {
    // Buscar notícias da NewsAPI - exemplo top headlines no Brasil
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=br&category=business&pageSize=10&apiKey=${NEWSAPI_KEY}`)
    const data = await response.json()

    if (data.status !== 'ok') {
      return res.status(500).json({ error: 'Erro ao buscar notícias da NewsAPI' })
    }

    const artigos = data.articles.map(article => ({
      titulo: article.title,
      resumo: article.description,
      link: article.url,
      data: article.publishedAt
    }))

    // Inserir notícias na tabela 'noticias'
    const { error } = await supabase.from('noticias').insert(artigos)

    if (error) {
      return res.status(500).json({ error: 'Erro ao salvar notícias no Supabase', detalhes: error.message })
    }

    res.status(200).json({ message: 'Notícias atualizadas com sucesso', count: artigos.length })
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor', detalhes: error.message })
  }
}
