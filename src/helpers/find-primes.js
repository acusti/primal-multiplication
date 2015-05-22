let cachedPrimes = [];
let cachedComposites = [];

function findPrimes(length, isSingle = false) {
	let primes = [ ...primeIterator({ length }) ];
	return isSingle ? primes[primes.length - 1] : primes;
}

// Symbol.iterator for generating primes based on 6n +/- 1 factorization
function primeIterator({ length }) {
	// Use an incremental functional sieve to find primes, as described here:
	// https://www.cs.hmc.edu/~oneill/papers/Sieve-JFP.pdf
	if (length === undefined) {
		length = 10;
	}
	return {
		[Symbol.iterator] : function() {
			// Initialize our variables
			let count      = 0;
			let candidate  = 1;
			let composites = [];

			function updateCache(prime) {
				if (count < cachedPrimes.length) {
					return;
				}
				if (prime !== undefined) {
					cachedPrimes.push(prime);
				}
				cachedComposites = composites;
			}

			return {
				next : function() {
					// Are we done?
					if (count >= length) {
						return { done : true };
					}
					let result = {
						done : false
					};
					// Check cache
					if (cachedPrimes[count] !== undefined) {
						// If using cache and this is the first time through, set up our composites
						if (!count) {
							composites = cachedComposites;
						}
						candidate = cachedPrimes[count];
						result.value = candidate;
						count++;
						return result;
					}
					// First prime is 2
					// We never check even numbers, so no need to check its composites
					if (!count) {
						result.value = 2;
						count++;
						updateCache(result.value);
						return result;
					}
					// Increment over odd numbers
					candidate += 2;
					// Check if its already defined
					let composite = composites[candidate];
					let nextComposite;
					if (!composite) {
						// Found a prime!
						// Add its increment value (prime * 2 to skip even composites) to composites
						// Starting at the prime squared is an easy optimization
						nextComposite = candidate * candidate;
						composites[nextComposite] = composites[nextComposite] || [];
						composites[nextComposite].push(candidate * 2);
						// Set iterator return value
						result.value = candidate;
						count++;
						updateCache(result.value);
						return result;
					}
					// Current candidate matches another prime composite
					// Remove current composites, and use their increments to set the next ones
					delete composites[candidate];
					// Set next composites using stored increments
					composite.forEach((increment) => {
						nextComposite = candidate + increment;
						composites[nextComposite] = composites[nextComposite] || [];
						composites[nextComposite].push(increment);
					});
					// No matching prime, so check the next one
					return this.next();
				}
			};
		}
	};
}

export default findPrimes;
