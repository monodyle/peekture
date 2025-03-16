import { useQuery } from '@tanstack/react-query'
import persisted from '../persisted'

export function useLUTs() {
  return useQuery({
    queryKey: ['lut'],
    queryFn: () => persisted.read((state) => state.luts),
  })
}
