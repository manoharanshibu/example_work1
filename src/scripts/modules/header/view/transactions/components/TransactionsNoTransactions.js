import TransactionsEmpty from "header/view/transactions/components/TransactionsEmpty";

const TransactionsNoTransactions = () => {
		return (
			<TransactionsEmpty>
				<span className="empty-notice">{App.Intl('mybets.no_bets_display', {}, 3)}</span>
			</TransactionsEmpty>
		);
};

export default TransactionsNoTransactions;
