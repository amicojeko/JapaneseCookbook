require 'json'
require 'yaml'
require 'pathname'

BASE_URL = 'https://ricettegiapponesi.jeko.net'
RECIPES_DIR = Pathname.new('recipes')
INGREDIENTS_DIR = Pathname.new('ingredients')

# Extract text between Markdown headers
def extract_section(content, section)
  regex = /^##\s*#{section}\s*\n(.*?)(?=^##|\z)/m
  match = content.match(regex)
  match ? match[1].strip : nil
end

# Extract bullet list items as an array
def extract_bullets(text)
  return [] unless text
  text.lines.map(&:strip).select { |line| line.start_with?('-') }.map { |line| line[1..].strip }
end

# Extract image URLs and convert them to absolute URLs
def extract_images(text)
  return [] unless text
  text.scan(/!\[.*?\]\((\/.*?)\)/).map { |match| BASE_URL + match[0] }
end

# Rewrite markdown links [text](/path/file) to [text](https://...)
def rewrite_links(text)
  text.gsub(/\[(.*?)\]\((\/.*?).md\)/) do
    label = Regexp.last_match(1)
    path = Regexp.last_match(2)
    "[#{label}](#{BASE_URL}#{path})"
  end
end

# Build public URL from relative file path
def build_url(file_path, base_dir)
  relative_path = file_path.relative_path_from(base_dir).to_s
  web_path = relative_path.sub(/\.md$/, '')
  BASE_URL + '/' + base_dir.to_s + '/' + web_path
end

# Parse a Markdown file with frontmatter
def parse_markdown(file_path, base_dir:, extract_sections: false)
  content = File.read(file_path)
  if content =~ /\A---\s*\n(.*?)\n---\s*\n(.*)/m
    frontmatter = YAML.safe_load($1)

    if frontmatter['visibility'] == 'hidden'
      puts "🚫 Skipping hidden file: #{file_path}"
      return nil
    end

    body = rewrite_links($2.strip)
    url = build_url(file_path, base_dir)

    data = {
      title: frontmatter['title'],
      description: frontmatter['description'],
      url: url,
      content: body,
      images: extract_images(body)
    }

    if extract_sections
      ingredient_text = extract_section(body, 'Ingredienti')
      preparation_text = extract_section(body, 'Preparazione')

      data[:ingredients] = extract_bullets(ingredient_text)
      data[:preparation] = preparation_text
    end

    data
  else
    puts "⚠️ Missing frontmatter in: #{file_path}"
    nil
  end
end

# Parse recipes
recipes = RECIPES_DIR.glob('**/*.md').map do |file|
  parse_markdown(file, base_dir: RECIPES_DIR, extract_sections: true)
end.compact

# Parse ingredients
ingredients = INGREDIENTS_DIR.glob('**/*.md').map do |file|
  parse_markdown(file, base_dir: INGREDIENTS_DIR)
end.compact

# Write output to JSON
output = {
  recipes: recipes,
  ingredients: ingredients
}

File.write('ricettario.json', JSON.pretty_generate(output))
puts "✅ Serialization complete: ricettario.json"
puts "📦 #{recipes.size} recipes, #{ingredients.size} ingredients"
