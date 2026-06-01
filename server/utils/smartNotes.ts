type StoredAction = {
  id: string
  text: string
  completed: boolean
}

type StoredNote = {
  id: string
  title: string
  content: string
  tags: string
  actions: string
}

const stopWords = new Set([
  'без', 'был', 'была', 'быть', 'вам', 'вас', 'ведь', 'весь', 'вот', 'все', 'для',
  'его', 'если', 'есть', 'еще', 'или', 'как', 'когда', 'кто', 'мне', 'мой', 'над',
  'надо', 'наш', 'нет', 'них', 'она', 'они', 'оно', 'при', 'про', 'так', 'там',
  'тебе', 'тебя', 'тем', 'того', 'тоже', 'уже', 'чем', 'что', 'это', 'этот',
  'будет', 'который', 'нужно', 'после', 'перед', 'через', 'with', 'from', 'have',
  'that', 'this', 'will', 'your',
])

const actionPatterns = [
  /^(?:[-*]\s*)?\[(?: |x)\]\s+(.+)$/i,
  /^(?:[-*]\s*)?((?:todo|задача|сделать|нужно|надо|необходимо|важно|позвонить|написать|купить|отправить|проверить|подготовить|записаться|создать|добавить|обсудить|встретиться)(?=[:\s-]|$)[:\s-]*(?:.+)?)$/i,
  /^(?:[-*]\s*)?([а-яё-]{3,}(?:ть|ться)(?=\s|$).*)$/i,
]

export function analyzeNote(title: string, content: string, previousActions = '[]') {
  return {
    tags: JSON.stringify(extractTags(`${title} ${content}`)),
    actions: JSON.stringify(extractActions(content, parseActions(previousActions))),
  }
}

export function serializeNote<T extends StoredNote>(note: T, allNotes: StoredNote[] = []) {
  const analysis = analyzeNote(note.title, note.content, note.actions)
  const tags = parseStrings(note.tags)
  const actions = parseActions(note.actions)
  const relatedNotes = allNotes
    .filter((candidate) => candidate.id !== note.id)
    .map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
      score: relationScore(note, candidate),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ id, title }) => ({ id, title }))

  return {
    ...note,
    tags: tags.length ? tags : parseStrings(analysis.tags),
    actions: actions.length ? actions : parseActions(analysis.actions),
    relatedNotes,
  }
}

export function normalizeActions(value: unknown) {
  if (!Array.isArray(value)) {
    return null
  }

  return value
    .filter((action): action is StoredAction => (
      typeof action === 'object' &&
      action !== null &&
      typeof action.id === 'string' &&
      typeof action.text === 'string' &&
      typeof action.completed === 'boolean'
    ))
    .map((action) => ({ ...action, text: action.text.trim() }))
    .filter((action) => action.text)
}

function extractTags(text: string) {
  const words = tokenize(text)
  const counts = new Map<string, number>()

  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 5)
    .map(([word]) => word)
}

function extractActions(content: string, previousActions: StoredAction[]) {
  const previousByText = new Map(previousActions.map((action) => [action.text.toLocaleLowerCase('ru'), action]))
  const found: StoredAction[] = []

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()

    for (const pattern of actionPatterns) {
      const match = line.match(pattern)

      if (!match) {
        continue
      }

      const text = (match[1] || line).trim().replace(/[.!?]+$/, '')
      const previous = previousByText.get(text.toLocaleLowerCase('ru'))
      found.push(previous ?? { id: createActionId(text), text, completed: /\[x\]/i.test(line) })
      break
    }
  }

  return found.slice(0, 8)
}

function relationScore(note: StoredNote, candidate: StoredNote) {
  const noteTags = new Set(parseStrings(note.tags))
  const candidateTags = new Set(parseStrings(candidate.tags))
  const sharedTags = [...noteTags].filter((tag) => candidateTags.has(tag)).length

  if (sharedTags) {
    return sharedTags * 3
  }

  const noteWords = new Set(tokenize(`${note.title} ${note.content}`))
  return [...new Set(tokenize(`${candidate.title} ${candidate.content}`))]
    .filter((word) => noteWords.has(word))
    .length
}

function tokenize(text: string) {
  return (text.toLocaleLowerCase('ru').match(/[a-zа-яё0-9]{4,}/gi) ?? [])
    .filter((word) => !stopWords.has(word))
}

function parseStrings(value: string) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function parseActions(value: string): StoredAction[] {
  try {
    return normalizeActions(JSON.parse(value)) ?? []
  } catch {
    return []
  }
}

function createActionId(text: string) {
  let hash = 0

  for (const character of text) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return `action-${hash.toString(36)}`
}
