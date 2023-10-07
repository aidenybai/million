import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { block } from 'million/react';

const RecipeFinder = () => {
  const [searchedQuery, setSearchedQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipieInstructions, setRecipieInstructions] = useState([]);
  const [recipieInstructionsId, setRecipieInstructionsId] = useState('');
  const API_KEY = '5a881b78656146509b31903824370ebb';

  const getRecipes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        // `https://forkify-api.herokuapp.com/api/search?q=${searchedQuery}`,
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${searchedQuery}`,
      );
      // console.log(response.data);
      console.log(response.data.results);
      setRecipes(response.data.results);
    } catch (error) {
      setError('An error occurred while fetching recipes.');
    } finally {
      setLoading(false);
    }
  };
  const getRecipeInfo = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        // `https://forkify-api.herokuapp.com/api/search?q=${searchedQuery}`,
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}&includeNutrition=false`,
      );
      // console.log(response);
      setRecipieInstructionsId(response.data.id);
      setRecipieInstructions(response.data.extendedIngredients);
    } catch (error) {
      setError('An error occurred while fetching instructions.');
    } finally {
      setLoading(false);
    }
  };
  const removeFromCart = (recipeId) => {
    // Filter out the recipe with the specified recipeId from the cart
    const updatedCart = cart.filter((item) => item.id !== recipeId);
    setCart(updatedCart);
  };
  const addToCart = (recipe) => {
    setCart([...cart, recipe]);
  };
  console.log(recipieInstructions);
  return (
    <>
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
            flexBasis: '70%',
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
                  <div
                    style={{
                      display: 'flex',
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
                    <div
                      style={{
                        width: '100%',
                      }}
                    >
                      <h2
                        style={{
                          margin: '0',
                          textAlign: 'center',
                        }}
                      >
                        {recipe.title}
                      </h2>
                      <div
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'silver',
                          margin: '1px 10px',
                          borderRadius: '0.6rem',
                          height: '11rem',
                          maxHeight: '11rem',
                          overflowY: 'scroll',
                        }}
                      >
                        {recipieInstructions.length > 0 &&
                        recipieInstructionsId === recipe.id ? (
                          <div>
                            {recipieInstructions.map((item, index) => (
                              <span key={index}>{item.original}; </span>
                            ))}
                          </div>
                        ) : (
                          <div
                            style={{
                              margin: 'auto',
                              padding: '4rem',
                            }}
                          >
                            <button onClick={() => getRecipeInfo(recipe.id)}>
                              Show Instructions
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
            width: '30%',
            color: 'black',
            marginLeft: '1rem',
          }}
        >
          <Cart
            cartItems={cart}
            removeFromCart={removeFromCart}
            recipieInstructions={recipieInstructions}
            recipieInstructionsId={recipieInstructionsId}
            getRecipeInfo={getRecipeInfo}
          />
        </div>
      </div>
    </>
  );
};

export default RecipeFinder;

const Cart = block(
  ({
    cartItems,
    removeFromCart,
    recipieInstructions,
    recipieInstructionsId,
    getRecipeInfo,
  }) => {
    return (
      <div>
        <h2
          style={{
            color: 'white',
          }}
        >
          Cart
        </h2>
        <p
          style={{
            color: 'white',
          }}
        >
          No. of items in CART: {cartItems.length}
        </p>
        <div>
          {cartItems &&
            cartItems.map((recipe, index) => (
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
                    height: '11rem',
                    maxHeight: '11rem',
                    overflowY: 'scroll',
                  }}
                >
                  {recipieInstructions.length > 0 &&
                  recipieInstructionsId === recipe.id ? (
                    <div
                      style={{
                        textAlign: 'left',
                      }}
                    >
                      {recipieInstructions.map((item, index) => (
                        <span key={index}>{item.original}; </span>
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
                        onClick={() => getRecipeInfo(recipe.id)}
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
