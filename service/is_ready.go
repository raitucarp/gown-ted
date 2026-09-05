package service

// IsReady checks if the lexical resource has completed initialization.
func (s *LexicalService) IsReady() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.resource != nil && s.ready
}
