/*
 * Minimal header for FLT_MAX/FLT_MIN - safe for assembly preprocessing.
 * Required for UIKit/UIStackView.h in iOS 18.5+ SDK which uses these without including float.h.
 * Use this instead of -include <float.h> to avoid pulling in C typedefs that break .S files.
 */
#ifndef FLT_MINMAX_H
#define FLT_MINMAX_H

#ifndef FLT_MAX
#define FLT_MAX 3.40282346638528859811704183484516925e+38F
#endif

#ifndef FLT_MIN
#define FLT_MIN 1.17549435082228750796873653722224568e-38F
#endif

#endif /* FLT_MINMAX_H */
