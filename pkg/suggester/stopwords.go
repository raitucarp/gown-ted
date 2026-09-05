package suggester

// StopWords is a set of common function words ignored during query context expansion.
var StopWords = map[string]bool{
	"a": true, "an": true, "the": true, "in": true, "on": true, "at": true,
	"by": true, "for": true, "with": true, "about": true, "against": true,
	"between": true, "into": true, "through": true, "during": true, "before": true,
	"after": true, "above": true, "below": true, "to": true, "from": true,
	"up": true, "down": true, "of": true, "off": true, "over": true, "under": true,
	"again": true, "further": true, "then": true, "once": true, "here": true,
	"there": true, "when": true, "where": true, "why": true, "how": true,
	"all": true, "any": true, "both": true, "each": true, "few": true,
	"more": true, "most": true, "other": true, "some": true, "such": true,
	"no": true, "nor": true, "not": true, "only": true, "own": true,
	"same": true, "so": true, "than": true, "too": true, "very": true,
	"is": true, "are": true, "was": true, "were": true, "be": true,
	"been": true, "being": true, "have": true, "has": true, "had": true,
	"having": true, "do": true, "does": true, "did": true, "doing": true,
	"would": true, "should": true, "could": true, "ought": true,
	"and": true, "but": true, "if": true, "or": true, "because": true,
	"as": true, "until": true, "while": true, "that": true, "which": true,
	"who": true, "whom": true, "this": true, "these": true, "those": true,
	"one": true, "used": true, "especially": true, "usually": true, "often": true,
}
