import axios from 'axios';
import { Dispatch } from 'redux'
import Party from '../pages/Party';
import { SearchDispatchType, SEARCH_BY_KEYWORD, SEARCH_BY_TAG } from "./searchType";

export const searchParty = (searchBy: string, region?: string) => async (dispatch: Dispatch<SearchDispatchType>) => {
  if(searchBy === 'byKeyword') {
    const res = await axios.get(`${process.env.REACT_APP_CLIENT_URL}/search?keyword=${searchBy}&region=${region}`)
    const party = res.data.result

    dispatch({
      type: SEARCH_BY_KEYWORD,
      payload: {
        parties: party
      }
    })
  }
  else if(searchBy === 'byTag') {
    const res = await axios.get(`${process.env.REACT_APP_CLIENT_URL}/search?tagName=${searchBy}&region=${region}`)
    const party = res.data.result

    dispatch({
      type: SEARCH_BY_TAG,
      payload: {
        parties: party
      }
    })
  }
}