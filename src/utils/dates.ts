import { format, parseISO, differenceInDays } from 'date-fns'

export const nights = (arrivalDate: string, departureDate: string): number =>
  differenceInDays(parseISO(departureDate), parseISO(arrivalDate))

export const formatDate = (iso: string): string =>
  format(parseISO(iso), 'MMM d, yyyy')

export const formatShortDate = (iso: string): string =>
  format(parseISO(iso), 'MMM d')
