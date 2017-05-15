import './TransactionsEmpty.scss';

const TransactionsEmpty = (props) => {
		return (
			<div className="c-transactions-empty">
				{props.children}
			</div>
		);
};

export default TransactionsEmpty;
