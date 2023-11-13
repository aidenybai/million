import React, { useState } from 'react';
import axios from 'axios';
import { block } from 'million/react';

const RecipeFinder = block(() => {
  const [searchedQuery, setSearchedQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipieInstructions, setRecipeInstructions] = useState([]);
  const [ingredientsInstructions, setIngredientsInstructions] = useState([]);
  const [recipieInstructionsId, setRecipeInstructionsId] = useState('');
  const API_KEY = '5a881b78656146509b31903824370ebb';

  const getRecipes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${searchedQuery}`,
      );
      setRecipes(response.data.results);
    } catch (error) {
      setError('An error occurred while fetching recipes.');
    } finally {
      setLoading(false);
    }
  };

  const showIns = async (recipe) => {
    setLoading(true);
    setError(null);

    try {
      await getRecipeInfo(recipe.id);
      await getIngredientsInfo(recipe.id);
      setRecipeInstructionsId(recipe.id);
    } catch (error) {
      setError('An error occurred while fetching instructions.');
    } finally {
      setLoading(false);
    }
  };

  const getRecipeInfo = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/${id}/analyzedInstructions?apiKey=${API_KEY}`,
      );
      // console.log(response);
      setRecipeInstructions(response.data[0].steps);
    } catch (error) {
      setError('An error occurred while fetching instructions.');
    } finally {
      setLoading(false);
    }
  };

  const getIngredientsInfo = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}&includeNutrition=false`,
      );
      console.log(response.data.extendedIngredients);
      setRecipeInstructionsId(response.data.id);
      setIngredientsInstructions(response.data.extendedIngredients);
    } catch (error) {
      setError('An error occurred while fetching instructions.');
    } finally {
      setLoading(false);
    }
  };
  const removeFromCart = (recipeId) => {
    const updatedCart = cart.filter((item) => item.id !== recipeId);
    setCart(updatedCart);
  };
  const addToCart = (recipe) => {
    setCart([...cart, recipe]);
  };

  return (
    <div>
      <h1
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: '3rem',
        }}
      >
        Recipe Finder
      </h1>
      <div
        style={{
          display: 'flex',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            flexBasis: '65%',
            backgroundColor: 'black',
            borderRadius: '1.5rem',
          }}
        >
          <form
            style={{
              marginTop: '1rem',
            }}
            onSubmit={(e) => {
              e.preventDefault();
              getRecipes();
            }}
          >
            <input
              style={{
                width: '70%',
                borderRadius: '3rem',
                padding: '5px 17px',
                fontSize: '1.3rem',
                margin: '10px 5px',
              }}
              type="text"
              placeholder="Enter a recipe keyword..."
              value={searchedQuery}
              onChange={(e) => setSearchedQuery(e.target.value)}
            />
            <button
              style={{
                borderRadius: '0.5rem',
                padding: '5px 17px',
                fontSize: '1.3rem',
                margin: '10px 5px',
              }}
              type="submit"
            >
              Search
            </button>
          </form>
          {loading && (
            <p
              style={{
                fontSize: '3rem',
              }}
            >
              Loading...
            </p>
          )}
          {error && <p>{error}</p>}

          <div
            style={{
              textAlign: 'left',
              justifyContent: 'left',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {recipes &&
              recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  style={{
                    color: 'black',
                    // textAlign:"center",
                    border: '1px solid blue',
                    margin: '1rem 1rem',
                    padding: '1.5rem',
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        textAlign: 'center',
                        margin: 'auto',
                      }}
                    >
                      <img
                        style={{
                          margin: '0',
                          borderRadius: '1rem',
                          height: '15rem',
                          maxWidth: '48%',
                        }}
                        src={recipe.image}
                        alt={recipe.title}
                      />
                    </div>
                    <h1
                      style={{
                        margin: '0',
                        textAlign: 'center',
                      }}
                    >
                      {recipe.title}
                    </h1>

                    <div
                      style={{
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'silver',
                          margin: '1px 10px',
                          borderRadius: '0.6rem',
                          height: 'auto',
                          maxHeight: '20rem',
                          overflowY: 'scroll',
                        }}
                      >
                        {recipieInstructions.length > 0 &&
                        ingredientsInstructions.length > 0 &&
                        recipieInstructionsId === recipe.id ? (
                          <div>
                            <div>
                              <h2>Ingredients</h2>

                              <ol>
                                {ingredientsInstructions &&
                                  ingredientsInstructions.map((it, index) => (
                                    <li key={index}>{it.original}.</li>
                                  ))}
                              </ol>
                            </div>
                            <h2>Method of Preparations</h2>
                            {recipieInstructions.map((item, index) => (
                              <span key={index}>{item.step} </span>
                            ))}
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                            }}
                          >
                            <button onClick={() => showIns(recipe)}>
                              Show Instruction
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '1rem',
                      textAlign: 'center',
                      width: '100%',
                    }}
                  >
                    {cart.some((cartitem) => cartitem.id === recipe.id) ? (
                      <p>Item already in cart</p>
                    ) : (
                      <button
                        style={{
                          width: '100%',
                          borderRadius: '5rem',
                        }}
                        onClick={() => addToCart(recipe)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div
          style={{
            width: '35%',
            color: 'black',
            marginLeft: '1rem',
            backgroundColor: '#252525',
            borderRadius: '1.5rem',
            paddingX: '1rem',
          }}
        >
          <Cart
            cartItems={cart}
            removeFromCart={removeFromCart}
            recipieInstructions={recipieInstructions}
            recipieInstructionsId={recipieInstructionsId}
            getRecipeInfo={showIns}
            ingredientsInstructions={ingredientsInstructions}
          />
        </div>
      </div>
    </div>
  );
});

const Cart = block(
  ({
    cartItems,
    removeFromCart,
    recipieInstructions,
    recipieInstructionsId,
    getRecipeInfo,
    ingredientsInstructions,
  }) => {
    return (
      <div>
        <h1
          style={{
            color: 'white',
          }}
        >
          Cart
        </h1>
        <p
          style={{
            color: 'white',
          }}
        >
          No. of items in CART: {cartItems.length}
        </p>
        <div
          style={{
            padding: '1rem',
          }}
        >
          {cartItems &&
            cartItems.map((recipe) => (
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  margin: '1rem 0',
                }}
                key={recipe.id}
              >
                <h4
                  style={{
                    margin: '0',
                    padding: '10px',
                  }}
                >
                  {recipe.title}
                </h4>

                <img
                  style={{
                    margin: '0',
                    borderRadius: '1rem',
                    height: '12rem',
                    maxWidth: '85%',
                  }}
                  src={recipe.image}
                  alt={recipe.title}
                />
                <div
                  style={{
                    width: '80%',
                    padding: '0.5rem',
                    backgroundColor: 'silver',
                    margin: 'auto',
                    borderRadius: '0.6rem',
                    height: 'auto',
                    maxHeight: '15rem',
                    overflowY: 'scroll',
                    textAlign: 'left',
                  }}
                >
                  {recipieInstructions.length > 0 &&
                  ingredientsInstructions.length > 0 &&
                  recipieInstructionsId === recipe.id ? (
                    <div>
                      <div>
                        <h2>Ingredients</h2>

                        <ol>
                          {ingredientsInstructions &&
                            ingredientsInstructions.map((it, index) => (
                              <li key={index}>{it.original}.</li>
                            ))}
                        </ol>
                      </div>
                      <h2>Method of Preparations</h2>
                      {recipieInstructions.map((item, index) => (
                        <span key={index}>{item.step} </span>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        margin: 'auto',
                        padding: '1rem',
                      }}
                    >
                      <button
                        style={{
                          width: '100%',
                          borderRadius: '1rem',
                        }}
                        onClick={() => getRecipeInfo(recipe)}
                      >
                        Show Instructions
                      </button>
                    </div>
                  )}
                </div>
                <button
                  style={{
                    margin: '1rem 0',
                    width: '80%',
                    borderRadius: '5rem',
                  }}
                  onClick={() => removeFromCart(recipe.id)}
                >
                  Remove from Cart
                </button>
              </div>
            ))}
        </div>
      </div>
    );
  },
);

export default RecipeFinder;
