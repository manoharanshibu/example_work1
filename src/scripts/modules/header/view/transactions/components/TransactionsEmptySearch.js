import TransactionsEmpty from "header/view/transactions/components/TransactionsEmpty";

const TransactionsEmptySearch = (props) => {
		const {searchToken} = props;
		return (
			<TransactionsEmpty>
				{App.Intl('mybets.general.your_search_for')} <strong>"{searchToken}"</strong> {App.Intl('mybets.general.did_not_match_any_results')}
			</TransactionsEmpty>
		);
};

export default TransactionsEmptySearch;
