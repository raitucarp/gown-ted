package analyzer

import (
	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown/expansion"
)

// BuildTrees builds conceptual hierarchy and expansion graph for a primary lemma.
func BuildTrees(res *gown.LexicalResource, primaryLemma string) (hierarchyTree string, expansionRoot *expansion.Node) {
	tree, err := expansion.Expand(res, primaryLemma, expansion.WithMaxDepth(3), expansion.WithMaxNodes(20))
	if err == nil && tree != nil {
		return tree.Render(), tree.Root
	}
	return "", nil
}
